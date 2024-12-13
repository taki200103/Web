import React, { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import InfoTab from "./InfoTab";
import MembersTab from "./MembersTab";
import TasksTab from "./TasksTab";

const GroupMenu = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleChangeTab = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{
      width: '14  00px',
      height: '600px',
      bgcolor: 'background.paper',
      overflow: 'auto'
    }}>
      <Tabs 
        value={activeTab} 
        onChange={handleChangeTab} 
        indicatorColor="primary" 
        textColor="primary"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Info" />
        <Tab label="Members" />
        <Tab label="Tasks" />
      </Tabs>

      <Box sx={{ p: 2 }}>
        {activeTab === 0 && <InfoTab />}
        {activeTab === 1 && <MembersTab />}
        {activeTab === 2 && <TasksTab />}
      </Box>
    </Box>
  );
};

export default GroupMenu;
