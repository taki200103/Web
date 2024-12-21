import React, { useState, useEffect } from "react";
import { Box, Tabs, Tab, CircularProgress } from "@mui/material";
import InfoTab from "./InfoTab";
import MembersTab from "./MembersTab";
import TasksTab from "./TasksTab";
import ChatTab from "./ChatTab";
import axios from 'axios';

const GroupMenu = ({ group }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [groupDetails, setGroupDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!group?.group_id) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(
          `http://localhost:3000/api/groups/${group.group_id}/details`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        setGroupDetails(response.data.groupInfo);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching group details:', error);
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [group]);

  const handleChangeTab = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'background.paper',
    }}>
      <Tabs 
        value={activeTab} 
        onChange={handleChangeTab} 
        indicatorColor="primary" 
        textColor="primary"
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          minHeight: '48px',
          '& .MuiTab-root': {
            minHeight: '48px',
            textTransform: 'none',
          }
        }}
      >
        <Tab label="Info" />
        <Tab label="Members" />
        <Tab label="Tasks" />
        <Tab label="Chat" />
      </Tabs>

      <Box sx={{ 
        flexGrow: 1,
        overflow: 'hidden',
        position: 'relative'
      }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {activeTab === 0 && <InfoTab groupInfo={groupDetails} loading={loading} />}
            {activeTab === 1 && <MembersTab groupId={group?.group_id} />}
            {activeTab === 2 && <TasksTab groupId={group?.group_id} />}
            {activeTab === 3 && <ChatTab groupId={group?.group_id} />}
          </>
        )}
      </Box>
    </Box>
  );
};

export default GroupMenu;
