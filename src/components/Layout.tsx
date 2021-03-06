import * as React from 'react';
import styled from 'styled-components';

import AddBanDialog from '../containers/Dialogs/AddBanDialog';
import AddEditServerDialog from '../containers/Dialogs/AddEditServerDialog';
import AddTaskDialog from '../containers/Dialogs/AddTaskDialog';
import AddWhitelistDialog from '../containers/Dialogs/AddWhitelistDialog';
import PlayerProfileDialog from '../containers/Dialogs/PlayerProfileDialog';
import SettingsDialog from '../containers/Dialogs/SettingsDialog';
import HeaderBar from '../containers/HeaderBar';
import NavigationBar from '../containers/NavigationBar';
import Notifications from '../containers/Notifications';
import PlayersList from '../containers/PlayersSidebar';
import ProgressBar from '../containers/ProgressBar';
import ServerBar from '../containers/ServerBar';
import TitleBar from './TitleBar';

export const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
`;
const Content = styled.div`
  display: flex;
  flex-grow: 1;
  height: 100%;
  width: 100%;
`;
const ContentColumn = styled(Content)`
  flex-direction: column;
`;

type Props = {};
const Layout: React.FunctionComponent<Props> = ({ children }) => {
  return (
    <Wrapper>
      <TitleBar />
      <Content>
        <ServerBar />
        <NavigationBar />
        <ContentColumn>
          <HeaderBar />
          <Content>
            {children}
            <PlayersList />
          </Content>
        </ContentColumn>
      </Content>
      <PlayerProfileDialog />
      <AddEditServerDialog variant={'add'} />
      <AddEditServerDialog variant={'edit'}/>
      <AddTaskDialog />
      <SettingsDialog />
      <AddBanDialog />
      <AddWhitelistDialog />
      <Notifications />
      <ProgressBar />
    </Wrapper>
  );
};

export default Layout;
