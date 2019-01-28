import IconButton from '@material-ui/core/IconButton';
import TrashIcon from '@material-ui/icons/Delete';
import * as L from 'leaflet';
import 'leaflet-mouse-position';
import * as React from 'react';
import {
  FeatureGroup,
  LayersControl,
  Map as LeafletMap,
  MapComponent,
  Marker,
  Popup,
  TileLayer
} from 'react-leaflet';
import { connect } from 'react-redux';

import LeafletContextMenu from '../components/LeafletContextMenu';
import { MAP_BOUNDS } from '../constants/map-constants';
import {
  misMapActions,
  misMapSelectors,
  MisMapTypes,
  misMapUtils
} from '../redux/mismap';
import { ICustomMapMarker } from '../redux/mismap/types';
import { Dispatch, RootState } from '../redux/redux-types';
import { IServer } from '../redux/servers';
import { activeServerSelector } from '../redux/servers/selectors';

interface Props {
  dispatch: Dispatch;
  layers: MisMapTypes.MisMapMarkersByLayer;
  activeServer: IServer;
  addMarker: (marker: ICustomMapMarker) => void;
  deleteMarker: (id: number) => void;
  showing?: boolean;
}
interface State {
  map: {
    tileLayer: {
      url: {
        islands_sat: string;
      };
      crs: any;
      noWrap: boolean;
      bounds: L.LatLngBoundsLiteral;
      tms: boolean;
      attributionControl: boolean;
      trackResize: boolean;
      renderer: any;
      center: { lat: number; lng: number };
    };
    options: {
      center: { lat: number; lng: number };
      zoom: number;
      minZoom: number;
      maxZoom: number;
      maxBounds: L.LatLngBoundsLiteral;
    };
  };
  e: any; // event data from the left click sent to context menu
  contextMenuOpen: boolean;
  contextMenuAnchor: {
    x: number;
    y: number;
  };
}
class Map extends React.Component<Props, State> {
  mapRef!: MapComponent<any, any>;
  anchorDiv: any;
  public state: State = {
    map: {
      tileLayer: {
        url: {
          islands_sat: '../src/resources/maps/islands_sat/{z}/{x}/{y}.png'
        },
        crs: L.CRS.Simple,
        noWrap: true,
        bounds: MAP_BOUNDS,
        tms: true,
        attributionControl: false,
        trackResize: true,
        renderer: L.Canvas,
        center: { lat: -47, lng: -23 }
      },
      options: {
        center: { lat: -47, lng: -23 },
        zoom: 3,
        minZoom: 0,
        maxZoom: 6,
        maxBounds: MAP_BOUNDS
      }
    },
    e: null, // event data from the left click sent to context menu
    contextMenuOpen: false,
    contextMenuAnchor: {
      x: 900,
      y: 900
    }
  };

  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
    this.addMousePositionControlToMap();
  }

  componentDidUpdate(nextProps: Props) {
    if (nextProps.showing !== this.props.showing) {
      this.mapRef.leafletElement.invalidateSize();
    }
  }

  addMarker = () => {
    const { lat, lng } = this.state.e.latlng;
    const { x, y } = misMapUtils.convertLatLngToVec2(
      lat,
      lng,
      this.mapRef.leafletElement
    );
    this.props.addMarker({
      id: -1,
      serverID: this.props.activeServer.id,
      layer: 'Click Layer',
      posX: lat,
      posY: lng,
      content: `X:${x} Y:${y} `
    });
    this.closeContextMenu();
  };

  addMousePositionControlToMap = () => {
    (L.control as any)
      .mousePosition({
        position: 'bottomright',
        separator: ' : ',
        emptyString: 'Unavailable',
        lngFirst: true,
        numDigits: 5,
        lngFormatter: (x: number) =>
          `X: ${this.mapRef.leafletElement
            .project({ lat: 0, lng: x }, 5)
            .x.toFixed(0)}`,
        latFormatter: (y: number) =>
          `Y: ${8192 -
            this.mapRef.leafletElement
              .project({ lat: y, lng: 0 }, 5)
              .y.toFixed(0)}`,
        prefix: ''
      })
      .addTo(this.mapRef.leafletElement);
  };

  closeContextMenu = () => {
    this.setState({
      contextMenuOpen: false
    });
  };

  contextMenuClick = async (e: L.LeafletMouseEvent) => {
    this.mapRef.leafletElement.closePopup();

    // Set the anchor first and then open the context menu, otherwise the map jumps around
    await this.setState({
      contextMenuAnchor: {
        x: e.originalEvent.x,
        y: e.originalEvent.y
      }
    });
    await this.setState({
      e: { ...e },
      contextMenuOpen: true
    });
  };

  deleteMarker = (id: number) => {
    this.props.deleteMarker(id);
  };

  public render() {
    const { layers } = this.props;
    return (
      <LeafletMap
        oncontextmenu={this.contextMenuClick}
        ref={(ref: any) => (this.mapRef = ref)}
        {...this.state.map.options}
        style={{ height: '100%', width: '100%', background: 'transparent' }}
      >
        <LayersControl position="bottomleft">
          <TileLayer
            {...this.state.map.tileLayer}
            url={this.state.map.tileLayer.url.islands_sat}
          />
          {layers.map(([layerName, markers]) => (
            <LayersControl.Overlay name={layerName} key={layerName} checked>
              <FeatureGroup>
                {markers.map(({ id, posX, posY, content }) => (
                  <Marker key={id} position={[posX, posY]}>
                    <Popup>
                      {content}
                      <IconButton onClick={() => this.deleteMarker(id)}>
                        <TrashIcon color={'primary'} />
                      </IconButton>
                    </Popup>
                  </Marker>
                ))}
              </FeatureGroup>
            </LayersControl.Overlay>
          ))}
        </LayersControl>
        <div
          ref={(ref: any) => (this.anchorDiv = ref)}
          style={{
            position: 'absolute',
            left: this.state.contextMenuAnchor.x - 50,
            top: this.state.contextMenuAnchor.y - 10
          }}
        />
        <LeafletContextMenu
          addMarker={this.addMarker}
          anchorEl={this.anchorDiv}
          closeContextMenu={this.closeContextMenu}
          open={this.state.contextMenuOpen}
        />
      </LeafletMap>
    );
  }
}

export const mapStateToProps = (state: RootState) => ({
  layers: misMapSelectors.markersByLayerNameAndActiveServer(state),
  activeServer: activeServerSelector(state)
});
export const mapDispatchToProps = (dispatch: Dispatch) => ({
  addMarker: (marker: ICustomMapMarker) =>
    dispatch(misMapActions.addMarkerThunk(marker)),
  deleteMarker: (id: number) => dispatch(misMapActions.deleteMarkerThunk(id))
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Map);
