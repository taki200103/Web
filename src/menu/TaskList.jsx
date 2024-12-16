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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import SubmitTask from './SubmitTask';
import axios from 'axios';

const TaskTab = ({ taskTypeId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedTasks, setSelectedTasks] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [openSubmitTask, setOpenSubmitTask] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        
        const response = await axios.get(
          `http://localhost:3000/api/tasks/by-type/${taskTypeId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        console.log('Tasks received:', response.data);
        setTasks(response.data.tasks);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError(error.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu');
        setLoading(false);
      }
    };

    if (taskTypeId) {
      fetchTasks();
    }
  }, [taskTypeId]);

  const handleToggleSelect = (id) => {
    setSelectedTasks((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((taskId) => taskId !== id)
        : [...prevSelected, id]
    );
  };

  const handleDelete = async () => {
    try {
        const token = localStorage.getItem('authToken');
        
        // Gọi API xóa
        await axios.delete('http://localhost:3000/api/tasks/delete', {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            data: {
                taskIds: selectedTasks
            }
        });

        // Cập nhật state sau khi xóa thành công
        setTasks((prevTasks) => prevTasks.filter((task) => !selectedTasks.includes(task.id)));
        setSelectedTasks([]);

        // Thông báo thành công (tùy chọn)
        alert('Xóa công việc thành công!');

    } catch (error) {
        console.error('Error deleting tasks:', error);
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi xóa công việc!');
    }
  };

  const handleAdd = () => {
    setOpenSubmitTask(true);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (task) => {
    setSelectedTask(task);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTask(null);
  };

  const handleCloseSubmitTask = () => {
    setOpenSubmitTask(false);
  };

  const handleSubmitNewTask = async (newTaskData) => {
    try {
        const token = localStorage.getItem('authToken');
        const response = await axios.post(
            'http://localhost:3000/api/tasks/create',
            {
                ...newTaskData,
                taskTypeId
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const newTask = {
            id: tasks.length + 1,
            task: newTaskData.taskName,
            status: "PENDING",
            createdBy: response.data.task.createdBy,
            createdAt: new Date().toISOString().slice(0, 19).replace("T", " "),
            timeStart: `${newTaskData.dateBegin} ${newTaskData.timeBegin}`,
            timeEnd: `${newTaskData.dateEnd} ${newTaskData.timeEnd}`,
            description: newTaskData.description
        };

        setTasks((prevTasks) => [...prevTasks, newTask]);
        setOpenSubmitTask(false);

    } catch (error) {
        console.error('Error creating task:', error);
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi tạo công việc!');
    }
  };

  const handleEdit = () => {
    setEditFormData({
        taskName: selectedTask.task,
        description: selectedTask.description,
        dateBegin: selectedTask.timeStart.split(' ')[0],
        dateEnd: selectedTask.timeEnd.split(' ')[0],
        timeBegin: selectedTask.timeStart.split(' ')[1],
        timeEnd: selectedTask.timeEnd.split(' ')[1],
        status: selectedTask.status
    });
    setIsEditing(true);
  };

  const handleSubmitEdit = async () => {
    try {
        const token = localStorage.getItem('authToken');
        const response = await axios.put(
            `http://localhost:3000/api/tasks/update/${selectedTask.id}`,
            editFormData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        // Cập nhật state tasks
        setTasks(prevTasks => 
            prevTasks.map(task => 
                task.id === selectedTask.id 
                    ? { ...task, ...response.data.task }
                    : task
            )
        );

        setIsEditing(false);
        setOpenDialog(false);
        alert('Cập nhật công việc thành công!');

    } catch (error) {
        console.error('Error updating task:', error);
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật công việc!');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        Đang tải dữ liệu...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
        {error}
      </div>
    );
  }

  const displayedTasks = tasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <TableContainer component={Paper} style={{ marginTop: "20px", maxWidth: "90%", margin: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px 0" }}>
        <h2 style={{ textAlign: "center", flex: 1 }}>Danh Sách Công Việc</h2>
        <div>
          <Button
            variant="contained"
            color="primary"
            style={{ marginRight: "10px" }}
            onClick={handleAdd}
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
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell style={{ fontWeight: "bold" }}>Task</TableCell>
            <TableCell style={{ fontWeight: "bold" }}>Status</TableCell>
            <TableCell style={{ fontWeight: "bold" }}>Created By</TableCell>
            <TableCell style={{ fontWeight: "bold" }}>Created At</TableCell>
            <TableCell style={{ fontWeight: "bold" }}>Time Start</TableCell>
            <TableCell style={{ fontWeight: "bold" }}>Time End</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {displayedTasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center">
                Chưa có công việc nào
              </TableCell>
            </TableRow>
          ) : (
            displayedTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedTasks.includes(task.id)}
                    onChange={() => handleToggleSelect(task.id)}
                  />
                </TableCell>
                <TableCell>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleOpenDialog(task);
                    }}
                    style={{ textDecoration: 'none', color: '#1976d2' }}
                  >
                    {task.task}
                  </a>
                </TableCell>
                <TableCell>{task.status}</TableCell>
                <TableCell>{task.createdBy}</TableCell>
                <TableCell>{task.createdAt}</TableCell>
                <TableCell>{task.timeStart}</TableCell>
                <TableCell>{task.timeEnd}</TableCell>
              </TableRow>
            ))
          )}
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
          {selectedTask && !isEditing ? (
            <>
              <Typography variant="h6">{selectedTask.task}</Typography>
              <Typography>Status: {selectedTask.status}</Typography>
              <Typography>Created By: {selectedTask.createdBy}</Typography>
              <Typography>Created At: {selectedTask.createdAt}</Typography>
              <Typography>Time Start: {selectedTask.timeStart}</Typography>
              <Typography>Time End: {selectedTask.timeEnd}</Typography>
              <Typography>Description: {selectedTask.description}</Typography>
            </>
          ) : editFormData && (
            <form>
              <TextField
                fullWidth
                margin="normal"
                label="Task Name"
                value={editFormData.taskName}
                onChange={(e) => setEditFormData({
                  ...editFormData,
                  taskName: e.target.value
                })}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Description"
                multiline
                rows={4}
                value={editFormData.description}
                onChange={(e) => setEditFormData({
                  ...editFormData,
                  description: e.target.value
                })}
              />
              <TextField
                fullWidth
                margin="normal"
                type="date"
                label="Date Begin"
                value={editFormData.dateBegin}
                onChange={(e) => setEditFormData({
                  ...editFormData,
                  dateBegin: e.target.value
                })}
              />
              <TextField
                fullWidth
                margin="normal"
                type="time"
                label="Time Begin"
                value={editFormData.timeBegin}
                onChange={(e) => setEditFormData({
                  ...editFormData,
                  timeBegin: e.target.value
                })}
              />
              <TextField
                fullWidth
                margin="normal"
                type="date"
                label="Date End"
                value={editFormData.dateEnd}
                onChange={(e) => setEditFormData({
                  ...editFormData,
                  dateEnd: e.target.value
                })}
              />
              <TextField
                fullWidth
                margin="normal"
                type="time"
                label="Time End"
                value={editFormData.timeEnd}
                onChange={(e) => setEditFormData({
                  ...editFormData,
                  timeEnd: e.target.value
                })}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    status: e.target.value
                  })}
                >
                  <MenuItem value="PENDING">PENDING</MenuItem>
                  <MenuItem value="IN_PROGRESS">IN PROGRESS</MenuItem>
                  <MenuItem value="COMPLETED">COMPLETED</MenuItem>
                </Select>
              </FormControl>
            </form>
          )}
        </DialogContent>
        <DialogActions>
          {!isEditing ? (
            <>
              <Button onClick={handleEdit} variant="contained" color="primary">
                Edit
              </Button>
              <Button onClick={handleCloseDialog} variant="contained" color="secondary">
                Close
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleSubmitEdit} variant="contained" color="primary">
                Save
              </Button>
              <Button 
                onClick={() => {
                  setIsEditing(false);
                  setEditFormData(null);
                }} 
                variant="contained" 
                color="secondary"
              >
                Cancel
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={openSubmitTask} onClose={handleCloseSubmitTask} maxWidth="sm" fullWidth>
        <SubmitTask 
          onSubmit={handleSubmitNewTask} 
          onClose={handleCloseSubmitTask}
          taskTypeId={taskTypeId} 
        />
      </Dialog>
    </TableContainer>
  );
};

export default TaskTab;
