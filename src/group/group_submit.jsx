import React, { useState } from "react";
import { TextField, Button, Grid, Typography, Box } from "@mui/material";

const GroupSubmit = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    taskName: "",
    description: "",
    timeBegin: "",
    timeEnd: "",
    dateBegin: "",
    dateEnd: "",
    memberId: "", // Thêm trường Member ID
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
      memberId: "", // Reset Member ID
    });
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
        Group Submit
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
              label="Time Begin"
              name="timeBegin"
              type="time"
              value={formData.timeBegin}
              onChange={handleChange}
              required
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
              InputLabelProps={{
                shrink: true,
              }}
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
