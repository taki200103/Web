import React, { useState } from "react";
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
import GroupSubmit from "./group_submit"; // Nếu TasksTab.jsx nằm trong thư mục group

const TaskTab = () => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      task: "Project 1 (Chung) - HK 2024.1",
      status: "RUNNING",
      createdBy: "admin",
      createdAt: "2024-09-22 07:33:10",
      timeStart: "2024-09-22 08:00:00",
      timeEnd: "2024-09-22 16:00:00",
      description: "This is the first project.",
      assignTo: "Member1", // Thêm trường assignTo
    },
    {
      id: 2,
      task: "C_BASIC_STACK",
      status: "COMPLETED",
      createdBy: "tung.nguyenviet",
      createdAt: "2023-10-26 05:56:49",
      timeStart: "2023-10-26 06:00:00",
      timeEnd: "2023-10-26 18:00:00",
      description: "Basic stack implementation.",
      assignTo: "Member2", // Thêm trường assignTo
    },
  ]);

  const [selectedTasks, setSelectedTasks] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [openGroupSubmit, setOpenGroupSubmit] = useState(false); // Thêm state để mở GroupSubmit

  const handleToggleSelect = (id) => {
    setSelectedTasks((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((taskId) => taskId !== id)
        : [...prevSelected, id]
    );
  };

  const handleDelete = () => {
    setTasks((prevTasks) => prevTasks.filter((task) => !selectedTasks.includes(task.id)));
    setSelectedTasks([]);
  };

  const handleAdd = () => {
    setOpenGroupSubmit(true); // Mở GroupSubmit dialog để thêm mới
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

  const handleCloseGroupSubmit = () => {
    setOpenGroupSubmit(false);
  };

  const handleSubmitNewTask = (newTaskData) => {
    const newTask = {
      id: tasks.length + 1,
      task: newTaskData.taskName,
      status: "PENDING",
      createdBy: "admin",
      createdAt: new Date().toISOString().slice(0, 19).replace("T", " "),
      timeStart: `${newTaskData.dateBegin} ${newTaskData.timeBegin}`,
      timeEnd: `${newTaskData.dateEnd} ${newTaskData.timeEnd}`,
      description: newTaskData.description,
      assignTo: newTaskData.memberId, // Gán assignTo từ GroupSubmit
    };
    setTasks((prevTasks) => [...prevTasks, newTask]);
    setOpenGroupSubmit(false);
  };

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
            <TableCell style={{ fontWeight: "bold" }}>Assign To</TableCell>
            <TableCell style={{ fontWeight: "bold" }}>Created By</TableCell>
            <TableCell style={{ fontWeight: "bold" }}>Created At</TableCell>
            <TableCell style={{ fontWeight: "bold" }}>Time Start</TableCell>
            <TableCell style={{ fontWeight: "bold" }}>Time End</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {displayedTasks.map((task) => (
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
                >
                  {task.task}
                </a>
              </TableCell>
              <TableCell>{task.status}</TableCell>
              <TableCell>{task.assignTo}</TableCell>
              <TableCell>{task.createdBy}</TableCell>
              <TableCell>{task.createdAt}</TableCell>
              <TableCell>{task.timeStart}</TableCell>
              <TableCell>{task.timeEnd}</TableCell>
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
          {selectedTask ? (
            <>
              <Typography variant="h6">{selectedTask.task}</Typography>
              <Typography>Status: {selectedTask.status}</Typography>
              <Typography>Assign To: {selectedTask.assignTo}</Typography>
              <Typography>Created By: {selectedTask.createdBy}</Typography>
              <Typography>Created At: {selectedTask.createdAt}</Typography>
              <Typography>Time Start: {selectedTask.timeStart}</Typography>
              <Typography>Time End: {selectedTask.timeEnd}</Typography>
              <Typography>Description: {selectedTask.description}</Typography>
            </>
          ) : (
            <Typography>No Task Selected</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained" color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openGroupSubmit} onClose={handleCloseGroupSubmit} maxWidth="sm" fullWidth>
        <GroupSubmit onSubmit={handleSubmitNewTask} onClose={handleCloseGroupSubmit} />
      </Dialog>
    </TableContainer>
  );
};

export default TaskTab;
