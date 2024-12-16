import React, { useState } from "react";
import { TextField, Button, Grid, Typography, Box } from "@mui/material";

const SubmitTask = ({ onSubmit, onClose, taskTypeId }) => {
  const [formData, setFormData] = useState({
    taskName: "",
    description: "",
    timeBegin: "",
    timeEnd: "",
    dateBegin: "",
    dateEnd: "",
    taskTypeId: taskTypeId
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
        `http://localhost:3000/api/tasks/by-type/${taskTypeId}`,
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
        task.task.toLowerCase() === formData.taskName.toLowerCase()
      );

      if (isDuplicate) {
        setErrors(prev => ({
          ...prev,
          taskNameError: "Tên công việc đã tồn tại trong danh sách!"
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
          taskTypeId: taskTypeId
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
        Submit Task
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
              label="Date Begin"
              name="dateBegin"
              type="date"
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
              label="Date End"
              name="dateEnd"
              type="date"
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
              label="Time Begin"
              name="timeBegin"
              type="time"
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
              label="Time End"
              name="timeEnd"
              type="time"
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

export default SubmitTask;
