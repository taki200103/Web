import React, { useState, useEffect } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Checkbox,
  Button,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import GroupSubmit from "./group_submit";
import axios from 'axios';

const TaskTab = ({ groupId }) => {
  const [tasks, setTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [openGroupSubmit, setOpenGroupSubmit] = useState(false);
  const [isLeader, setIsLeader] = useState(false);
  const [editTask, setEditTask] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(
          `http://localhost:3000/api/groups/${groupId}/tasks`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        setTasks(response.data.tasks);
        setIsLeader(response.data.isLeader);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    if (groupId) {
      fetchTasks();
    }
  }, [groupId]);

  const handleToggleSelect = (taskId) => {
    if (!isLeader) return;
    setSelectedTasks((prevSelected) =>
      prevSelected.includes(taskId)
        ? prevSelected.filter((id) => id !== taskId)
        : [...prevSelected, taskId]
    );
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(
        `http://localhost:3000/api/groups/${groupId}/tasks`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          data: {
            taskIds: selectedTasks
          }
        }
      );

      setTasks(prevTasks => prevTasks.filter(task => !selectedTasks.includes(task.task_id)));
      setSelectedTasks([]);
      alert('Xóa công việc thành công!');
    } catch (error) {
      console.error('Error deleting tasks:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi xóa công việc!');
    }
  };

  const handleSubmitNewTask = async (formData) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `http://localhost:3000/api/groups/${groupId}/tasks`,
        {
          taskName: formData.taskName,
          description: formData.description,
          dateBegin: formData.dateBegin,
          dateEnd: formData.dateEnd,
          timeBegin: formData.timeBegin,
          timeEnd: formData.timeEnd,
          userId: formData.memberId
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setTasks(prev => [...prev, response.data.task]);
      setOpenGroupSubmit(false);
      alert('Thêm công việc thành công!');
    } catch (error) {
      console.error('Error adding task:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi thêm công việc!');
    }
  };

  const handleEditTask = async (formData) => {
    try {
        if (!editTask?.task_id) {
            throw new Error('Không tìm thấy task_id');
        }

        const token = localStorage.getItem('authToken');
        const response = await axios.put(
            `http://localhost:3000/api/groups/${groupId}/tasks/${editTask.task_id}`,
            {
                taskName: formData.taskName,
                description: formData.description,
                dateBegin: formData.dateBegin,
                dateEnd: formData.dateEnd,
                timeBegin: formData.timeBegin,
                timeEnd: formData.timeEnd,
                userId: formData.memberId
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        if (response.data.success) {
            setTasks(prev => prev.map(task => 
                task.task_id === editTask.task_id ? response.data.task : task
            ));
            setEditTask(null);
            setOpenGroupSubmit(false);
            alert('Cập nhật công việc thành công!');
        }
    } catch (error) {
        console.error('Error updating task:', error);
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật công việc!');
    }
  };

  const handleOpenDialog = (task) => {
    setSelectedTask(task);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTask(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCloseGroupSubmit = () => {
    setOpenGroupSubmit(false);
  };

  const displayedTasks = tasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <TableContainer component={Paper} style={{ marginTop: "20px", maxWidth: "90%", margin: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px 0" }}>
        <h2 style={{ textAlign: "center", flex: 1 }}>Danh Sách Công Việc</h2>
        {isLeader && (
          <div>
            <Button
              variant="contained"
              color="primary"
              style={{ marginRight: "10px" }}
              onClick={() => setOpenGroupSubmit(true)}
            >
              +
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleDelete}
              disabled={selectedTasks.length === 0}
            >
              -
            </Button>
          </div>
        )}
      </div>

      <Table>
        <TableHead>
          <TableRow>
            {isLeader && <TableCell />}
            <TableCell style={{ fontWeight: "bold" }}>Task</TableCell>
            <TableCell style={{ fontWeight: "bold" }}>Status</TableCell>
            <TableCell style={{ fontWeight: "bold" }}>Assign To</TableCell>
            <TableCell style={{ fontWeight: "bold" }}>Created At</TableCell>
            <TableCell style={{ fontWeight: "bold" }}>Time Start</TableCell>
            <TableCell style={{ fontWeight: "bold" }}>Time End</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {displayedTasks.map((task) => (
            <TableRow key={task.task_id}>
              {isLeader && (
                <TableCell>
                  <Checkbox
                    checked={selectedTasks.includes(task.task_id)}
                    onChange={() => handleToggleSelect(task.task_id)}
                  />
                </TableCell>
              )}
              <TableCell>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleOpenDialog(task);
                  }}
                  style={{ textDecoration: 'none', color: '#1976d2' }}
                >
                  {task.group_task_name}
                </a>
              </TableCell>
              <TableCell>{task.status}</TableCell>
              <TableCell>{task.user_name}</TableCell>
              <TableCell>
                {new Date(task.creation_date).toLocaleDateString()} {task.creation_time?.substring(0, 5)}
              </TableCell>
              <TableCell>
                {new Date(task.date_begin).toLocaleDateString()} {task.time_begin?.substring(0, 5)}
              </TableCell>
              <TableCell>
                {new Date(task.date_end).toLocaleDateString()} {task.time_end?.substring(0, 5)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TablePagination
        rowsPerPageOptions={[7, 10, 20]}
        component="div"
        count={tasks.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Task Details</DialogTitle>
        <DialogContent>
          {selectedTask && (
            <>
              <Typography variant="h6">{selectedTask.group_task_name}</Typography>
              <Typography>Status: {selectedTask.status}</Typography>
              <Typography>Assign To: {selectedTask.user_name}</Typography>
              <Typography>Created At: {new Date(selectedTask.creation_date).toLocaleDateString()} {selectedTask.creation_time?.substring(0, 5)}</Typography>
              <Typography>Time Start: {new Date(selectedTask.date_begin).toLocaleDateString()} {selectedTask.time_begin?.substring(0, 5)}</Typography>
              <Typography>Time End: {new Date(selectedTask.date_end).toLocaleDateString()} {selectedTask.time_end?.substring(0, 5)}</Typography>
              <Typography>Description: {selectedTask.task_description}</Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          {isLeader && (
            <Button 
              onClick={() => {
                handleCloseDialog();
                setEditTask(selectedTask);
                setOpenGroupSubmit(true);
              }} 
              color="primary"
            >
              Edit
            </Button>
          )}
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openGroupSubmit} onClose={handleCloseGroupSubmit} maxWidth="sm" fullWidth>
        <GroupSubmit 
          onSubmit={editTask ? handleEditTask : handleSubmitNewTask} 
          onClose={handleCloseGroupSubmit}
          groupId={groupId}
          editData={editTask}
        />
      </Dialog>
    </TableContainer>
  );
};

export default TaskTab;
