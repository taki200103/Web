import React, { useState } from "react";
import { TextField, Button, Grid, Typography, Box } from "@mui/material";

const GroupSubmit = ({ onSubmit, onClose, groupId, editData }) => {
  const [formData, setFormData] = useState({
    taskName: editData?.group_task_name || "",
    description: editData?.task_description || "",
    timeBegin: editData?.time_begin?.substring(0, 5) || "",
    timeEnd: editData?.time_end?.substring(0, 5) || "",
    dateBegin: editData?.date_begin?.substring(0, 10) || "",
    dateEnd: editData?.date_end?.substring(0, 10) || "",
    memberId: editData?.user_id || "",
  });

  const [errors, setErrors] = useState({
    dateError: "",
    timeError: "",
    taskNameError: ""
  });

  const validateDates = (newFormData) => {
    const { dateBegin, dateEnd, timeBegin, timeEnd } = newFormData;
    let newErrors = { ...errors, dateError: "", timeError: "" };

    if (dateBegin && dateEnd) {
      if (new Date(dateEnd) < new Date(dateBegin)) {
        newErrors.dateError = "Ngày kết thúc phải sau ngày bắt đầu";
      } else if (dateBegin === dateEnd && timeBegin && timeEnd) {
        if (timeEnd <= timeBegin) {
          newErrors.timeError = "Thời gian kết thúc phải sau thời gian bắt đầu";
        }
      }
    }

    setErrors(newErrors);
    return !newErrors.dateError && !newErrors.timeError;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    
    if (name === "taskName") {
      // Reset task name error when user types
      setErrors(prev => ({ ...prev, taskNameError: "" }));
    } else {
      validateDates(newFormData);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `http://localhost:3000/api/groups/${groupId}/tasks`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      const isDuplicate = data.tasks.some(task => 
        task.group_task_name.toLowerCase() === formData.taskName.toLowerCase() &&
        (!editData || task.task_id !== editData.task_id)
      );

      if (isDuplicate) {
        setErrors(prev => ({
          ...prev,
          taskNameError: "Tên công việc đã tồn tại trong nhóm!"
        }));
        return;
      }

      if (validateDates(formData)) {
        if (onSubmit) {
          onSubmit(formData);
        }
        setFormData({
          taskName: "",
          description: "",
          timeBegin: "",
          timeEnd: "",
          dateBegin: "",
          dateEnd: "",
          memberId: "",
        });
        setErrors({ dateError: "", timeError: "", taskNameError: "" });
      }
    } catch (error) {
      console.error("Error checking task name:", error);
      setErrors(prev => ({
        ...prev,
        taskNameError: "Lỗi khi kiểm tra tên công việc"
      }));
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        margin: "0 auto",
        padding: 3,
        backgroundColor: "#fff",
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          textAlign: "center",
          color: "#4682B4",
        }}
      >
        {editData ? 'Edit Task' : 'Create Task'}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Task Name"
              name="taskName"
              value={formData.taskName}
              onChange={handleChange}
              required
              error={!!errors.taskNameError}
              helperText={errors.taskNameError}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              multiline
              rows={4}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              name="dateBegin"
              value={formData.dateBegin}
              onChange={handleChange}
              required
              error={!!errors.dateError}
              helperText={errors.dateError}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="date"
              label="End Date"
              name="dateEnd"
              value={formData.dateEnd}
              onChange={handleChange}
              required
              error={!!errors.dateError}
              helperText={errors.dateError}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="time"
              label="Start Time"
              name="timeBegin"
              value={formData.timeBegin}
              onChange={handleChange}
              required
              error={!!errors.timeError}
              helperText={errors.timeError}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="time"
              label="End Time"
              name="timeEnd"
              value={formData.timeEnd}
              onChange={handleChange}
              required
              error={!!errors.timeError}
              helperText={errors.timeError}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Member ID"
              name="memberId"
              value={formData.memberId}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              sx={{ padding: "10px 0" }}
            >
              Submit
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default GroupSubmit;
