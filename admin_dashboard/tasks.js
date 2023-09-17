$(document).ready(function() {
    const table = $('#tasksTable').DataTable();
    const statusDistribution = {};
    const deadlineDistribution = {};

    const adminID = getURLParameter('adminID');
    if (!adminID)
    {
        // Redirect to login page
        window.location.href = 'login.html';
        return;
    }
    else
    {
        $('#employeesLink').attr('href', `employees.html?adminID=${adminID}`);
        $('#departmentsLink').attr('href', `departments.html?adminID=${adminID}`);
        $('#tasksLink').attr('href', `tasks.html?adminID=${adminID}`);
    }


    // Fetch admin details here
    $.ajax({
        url: 'api/api_get_admin_by_id.php',
        method: 'GET',
        data: { adminID },
        dataType: 'json',
        success: function(response) {
            console.log("Received response: ", response); // Debugging line
            if (response.status === 'success') {
                const admin = response.data[0];  // Note the [0] to get the first item in the array
                console.log(admin);
                $('#adminUsername').text(admin.username);
                $('#adminName').text(admin.name + ' ' + admin.surname);
                $('#adminLastLogin').text("Last Login: " + admin.last_login);
                $("#adminInfo").hover(
                    function() { // On hover
                        $("#adminLastLogin").show();
                    }, function() { // Off hover
                        $("#adminLastLogin").hide();
                    }
                );




            } else {
                alert("Error fetching admin details.");
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log("AJAX error: ", textStatus, errorThrown); // Error logging
        }
    });

    $('#logoutBtn').click(function() {
        // Implement your logout logic here
        window.location.href = 'login.html';
    });



    showStatusChart();

    // Function to initialize a pie chart
    const initPieChart = (chartId, title, data) => {
        Highcharts.chart(chartId, {
            chart: {
                type: 'pie'
            },
            title: {
                text: title
            },
            series: [{
                name: 'Employees',
                colorByPoint: true,
                data: data
            }]
        });
    };

    // Function to initialize the Gantt Chart for Deadlines
    const initDeadlineChart = (chartId, title, data) => {
        Highcharts.ganttChart(chartId, {
            title: {
                text: title
            },
            xAxis: {
                type: 'datetime',
                currentDateIndicator: true
            },
            yAxis: {
                title: {
                    text: 'Tasks'
                }
            },
            series: [
                {
                    name: 'Tasks',
                    data: data
                }
            ]
        });
    };






    // Fetch data from the server
    $.ajax({
        url: 'api/api_get_all_tasks.php',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.status === 'success') {
                console.log(response.data);
                // Populate the DataTable and prepare departmentData for the chart
                const deadlineData = [];  // For Gantt chart
                response.data.forEach((task,index) => {
                    table.row.add([
                        task.id,
                        task.employee_id,
                        task.description,
                        task.deadline,
                        task.status,
                        `<div class="ui mini buttons">
                        <button class="ui green icon button" onclick="updateTask(${task.id})">
                            <i class="edit icon"></i>
                        </button>
                        <button class="ui red icon button" onclick="updateDepartment(${task.id})">
                            <i class="trash icon"></i>
                        </button>
                    </div>`
                    ]).draw(false);

                    statusDistribution[task.status] = (statusDistribution[task.status] || 0) + 1;
                    const deadline = new Date(task.deadline);  // Convert to JavaScript date

                    deadlineData.push({
                        start: Date.UTC(deadline.getFullYear(), deadline.getMonth(), deadline.getDate()),
                        end: Date.UTC(deadline.getFullYear(), deadline.getMonth(), deadline.getDate() + 1), // Add 1 day to show on chart
                        name: task.description,
                        y: index
                    });

                });
                // Prepare and initialize the department distribution chart
                const statusChartData = Object.entries(statusDistribution).map(([name, y]) => ({ name, y }));
                initPieChart('statusChart', 'Status Distribution', statusChartData);
                // Initialize Gantt Chart
                initDeadlineChart('deadlineChart', 'Deadline Distribution (Gantt Chart)', deadlineData);


            } else {
                console.error("Received non-success status:", response.status);
            }
        },
        error: function(xhr, status, error) {
            console.error("An error occurred:", error);
        }
    });

});



function deleteEmployee(id) {
    // Open the Semantic UI modal
    $('#deleteModal').modal({
        closable: false,
        onApprove: function() {
            // Delete logic here
            $.ajax({
                url: 'api/api_delete_employee.php',
                type: 'GET',
                data: { id: id },
                dataType: 'json',
                success: function(response) {
                    if (response.success) {
                        alert('Employee deleted successfully.');

                        // Refresh the DataTable or remove the row
                        const table = $('#employeeTable').DataTable();
                        table.row($(`button[onclick="deleteEmployee(${id})"]`).parents('tr')).remove().draw();
                        // Reload the page
                        location.reload();
                    } else {
                        alert('Failed to delete employee: ' + response.message);
                    }
                },
                error: function(xhr, status, error) {
                    alert('An error occurred: ' + error);
                }
            });
        }
    }).modal('show');
}


function updateTask(id) {
    // Fetch existing data for the department with the given ID from the server
    $.ajax({
        url: 'api/api_get_task_by_id.php',
        type: 'GET',
        data: { id: id },
        dataType: 'json',
        success: function(response) {
            if (response.status === 'success') {
                // Populate the update modal fields with the existing data
                $('#updateEmployee').val(response.data.employee_id);
                $('#updateDescription').val(response.data.description);
                $('#updateDeadline').val(response.data.deadline);
                $('#updateStatus').val(response.data.status);

                // Open the update modal
                $('#updateModal').modal({
                    closable: false,
                    onApprove: function() {
                        // Collect the new data from the form
                        const updatedData = {
                            id: id,
                            employee_id: $('#updateEmployee').val,
                            description: $('#updateDescription').val(),
                            deadline: $('#updateDeadline').val(),
                            status: $('#updateStatus').val,
                        };
                        console.log(updatedData);

                        // Send the updated data to the server
                        $.ajax({
                            url: 'api/api_update_task.php',
                            type: 'POST',
                            data: JSON.stringify(updatedData),
                            contentType: "application/json",
                            dataType: 'json',
                            success: function(response) {
                                if (response.status === 'success') {
                                    alert('Task updated successfully.');
                                    location.reload();
                                } else {
                                    alert('Failed to update task: ' + response.message);
                                }
                            },
                            error: function(xhr, status, error) {
                                alert('An error occurred: ' + error);
                            }
                        });
                    }
                }).modal('show');
            } else {
                alert('Failed to fetch task data: ' + response.message);
            }
        },
        error: function(xhr, status, error) {
            alert('An error occurred: ' + error);
        }
    });
}



function addTask() {
    const newTaskData = {
        employee_id: $('#addEmployeeID').val,
        name: $('#addDescription').val(),
        description: $('#addDeadline').val(),
        salary: $('#addStatus').val(),
    };

    // Send the data to your add employee API
    $.ajax({
        url: 'api/api_create_task.php',
        type: 'POST',
        data: JSON.stringify(newTaskData),
        contentType: "application/json",
        dataType: 'json',
        success: function(response) {
            if (response.status === 'success') {
                alert('Task added successfully.');
                location.reload();
            } else {
                alert('Failed to add task: ' + response.message);
            }
        },
        error: function(xhr, status, error) {
            alert('An error occurred: ' + error);
        }
    });
}

function showStatusChart() {
    document.getElementById("statusChart").style.display = "block";
    document.getElementById("deadlineChart").style.display = "none";

}

function showDeadlineChart() {
    document.getElementById("statusChart").style.display = "none";
    document.getElementById("deadlineChart").style.display = "block";
}


// Function to get URL parameters
function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}

function showAddTaskModal() {
    $.ajax({
        url: 'api/api_get_all_employees.php',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.status === 'success') {
                const employees = response.data;
                const employeeDropdown = $('#addEmployee');
                employeeDropdown.empty();
                employees.forEach(function(employee) {
                    employeeDropdown.append(new Option(employee.first_name + " " +employee.last_name, employee.last_name));
                });
                // Show the modal
                $('#addTaskModal').modal('show');
            } else {
                alert('Failed to fetch employees: ' + response.message);
            }
        },
        error: function(xhr, status, error) {
            alert('Failed to fetch employees: ' + error);
        }
    });
}
