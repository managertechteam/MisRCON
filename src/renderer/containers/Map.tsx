import IconButton from '@material-ui/core/IconButton';
import TrashIcon from '@material-ui/icons/Delete';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css';
import * as L from 'leaflet';
import 'leaflet-mouse-position';
import 'leaflet-defaulticon-compatibility';
import * as React from 'react';
import {
  FeatureGroup,
  LayersControl,
  Map as LeafletMap,
  Marker,
  Popup,
  TileLayer,
} from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';

import LeafletContextMenu from '../components/Menus/LeafletContextMenu';
import { map } from '../constants/map-constants';
import { playerSidebarOpenSelector } from '../redux/app/selectors';
import { misMapActions, misMapSelectors, misMapUtils } from '../redux/mismap';
import { activeServerSelector } from '../redux/servers/selectors';
import { LeafletMapState } from '../redux/mismap/types';

const Map: React.FunctionComponent = () => {
  // /////////////
  // Refs
  // /////////////
  const mapRef = React.useRef<any>(null);
  const anchorDiv = React.useRef<any>(null);

  // /////////////
  // Redux State
  // /////////////
  const sideBarShowing = useSelector(playerSidebarOpenSelector);
  const layers = useSelector(misMapSelectors.markersByLayerNameAndActiveServer);
  const activeServer = useSelector(activeServerSelector);

  // /////////////
  // Component State
  // /////////////
  const [state, setState] = React.useState<{
    map: LeafletMapState;
    e: any; // event data from the left click sent to context menu
    contextMenuOpen: boolean;
    contextMenuAnchor: {
      x: number;
      y: number;
    };
  }>({
    map,
    e: null, // event data from the left click sent to context menu
    contextMenuOpen: false,
    contextMenuAnchor: {
      x: 900,
      y: 900,
    },
  });
  const closeContextMenu = () => {
    setState({
      ...state,
      contextMenuOpen: false,
    });
  };
  const contextMenuClick = async (e: L.LeafletMouseEvent) => {
    mapRef.current!.leafletElement.closePopup();
    setState({
      ...state,
      contextMenuAnchor: {
        x: e.originalEvent.x - 250,
        y: e.originalEvent.y,
      },
      e: { ...e },
      contextMenuOpen: true,
    });
  };

  // /////////////
  // Redux Actions
  // /////////////
  const dispatch = useDispatch();
  const deleteMarker = (id: number) =>
    dispatch(misMapActions.deleteMapMarker(id));
  const addMarker = () => {
    const { lat, lng } = state.e.latlng;
    const { x, y } = misMapUtils.convertLatLngToVec2(
      lat,
      lng,
      mapRef.current!.leafletElement,
    );
    dispatch(
      misMapActions.addMapMarker({
        id: -1,
        serverID: activeServer.id,
        layer: 'Click Layer',
        posX: lat,
        posY: lng,
        content: `X:${x} Y:${y} `,
      }),
    );
    closeContextMenu();
  };

  // /////////////
  // Effects
  // /////////////
  // componentDidMount
  React.useEffect(() => {
    const addMousePositionControlToMap = () => {
      (L.control as any)
        .mousePosition({
          position: 'bottomright',
          separator: ' : ',
          emptyString: 'Unavailable',
          lngFirst: true,
          numDigits: 5,
          lngFormatter: (x: number) =>
            `X: ${mapRef
              .current!.leafletElement.project({ lat: 0, lng: x }, 5)
              .x.toFixed(0)}`,
          latFormatter: (y: number) =>
            `Y: ${8192 -
              mapRef
                .current!.leafletElement.project({ lat: y, lng: 0 }, 5)
                .y.toFixed(0)}`,
          prefix: '',
        })
        .addTo(mapRef.current!.leafletElement);
    };
    addMousePositionControlToMap();
  }, []);
  //  componentDidUpdate
  React.useEffect(
    () => {
      mapRef.current!.leafletElement.invalidateSize();
    },
    [sideBarShowing],
  );

  return (
    <LeafletMap
      oncontextmenu={contextMenuClick}
      ref={mapRef}
      {...state.map.options}
      style={{ height: '100%', width: '100%', background: 'transparent' }}
    >
      <LayersControl position="bottomleft">
        <TileLayer
          {...state.map.tileLayer}
          url={state.map.tileLayer.url.islands_sat}
        />
        {layers.map(([layerName, markers]) => (
          <LayersControl.Overlay name={layerName} key={layerName} checked>
            <FeatureGroup>
              {markers.map(({ id, posX, posY, content }) => (
                <Marker key={id} position={[posX, posY]}>
                  <Popup>
                    {content}
                    <IconButton onClick={() => deleteMarker(id)}>
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
        className={'menu-anchor'}
        ref={anchorDiv}
        style={{
          position: 'absolute',
          left: state.contextMenuAnchor.x - 50,
          top: state.contextMenuAnchor.y - 30,
        }}
      />
      <LeafletContextMenu
        addMarker={addMarker}
        anchorEl={anchorDiv.current}
        closeContextMenu={closeContextMenu}
        open={state.contextMenuOpen}
      />
    </LeafletMap>
  );
};

export default Map;
