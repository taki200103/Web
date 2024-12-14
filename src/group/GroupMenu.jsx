import React, { useState, useEffect } from "react";
import { Box, Tabs, Tab, CircularProgress } from "@mui/material";
import InfoTab from "./InfoTab";
import MembersTab from "./MembersTab";
import TasksTab from "./TasksTab";
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
        
        // Lấy thông tin group và số lượng thành viên
        const query = `
          SELECT 
            g.group_id,
            g.group_name,
            g.description,
            g.creation_date,
            g.time_created,
            u.user_name as leader_name,
            COUNT(gm.user_id) as member_count
          FROM "Group" g
          JOIN "Group_Member" gm ON g.group_id = gm.group_id
          JOIN "Users" u ON (
            SELECT user_id 
            FROM "Group_Member" 
            WHERE group_id = g.group_id 
            AND role = 'leader'
          ) = u.user_id
          WHERE g.group_id = '${group.group_id}'
          GROUP BY g.group_id, g.group_name, g.description, g.creation_date, g.time_created, u.user_name
        `;

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
      width: '1400px',
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
        {activeTab === 0 && <InfoTab groupInfo={groupDetails} loading={loading} />}
        {activeTab === 1 && <MembersTab groupId={group?.group_id} />}
        {activeTab === 2 && <TasksTab groupId={group?.group_id} />}
      </Box>
    </Box>
  );
};

export default GroupMenu;
