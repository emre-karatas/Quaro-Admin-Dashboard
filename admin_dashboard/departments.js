$(document).ready(function() {
    const table = $('#departmentTable').DataTable();

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



    const initBarChart = (chartId, title, data) => {
        // Map data to separate names and salaries
        const names = data.map(item => item.name);
        const salaries = data.map(item => item.salary);

        console.log(names);
        console.log(salaries);

        Highcharts.chart(chartId, {
            chart: {
                type: 'bar'
            },
            title: {
                text: title
            },
            xAxis: {
                categories: names,
                title: {
                    text: 'Departments'
                }
            },
            yAxis: {
                title: {
                    text: 'Salary'
                }
            },
            series: [{
                name: 'Salary',
                colorByPoint: true,
                data: salaries
            }]
        });
    }






    // Fetch data from the server
    $.ajax({
        url: 'api/api_get_all_departments.php',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.status === 'success') {
                const salaryData = [];  // To store the department names

                // Populate the DataTable and prepare departmentData for the chart
                response.data.forEach(department => {
                    table.row.add([
                        department.id,
                        department.name,
                        department.description,
                        department.average_salary,
                        `<div class="ui mini buttons">
                        <button class="ui green icon button" onclick="updateDepartment(${department.id})">
                            <i class="edit icon"></i>
                        </button>
                        <button class="ui red icon button" onclick="deleteDepartment(${department.id})">
                            <i class="trash icon"></i>
                        </button>
                    </div>`
                    ]).draw(false);

                    salaryData.push({ name: department.name, salary: parseFloat(department.average_salary) });  // Parse as float, if the salary is not already a number
                });


                // Debugging logs
                console.log(salaryData);

                // Initialize the bar charts
                initBarChart('salaryBarChart', 'Salary Distribution', salaryData);

            } else {
                console.error("Received non-success status:", response.status);
            }
        },
        error: function(xhr, status, error) {
            console.error("An error occurred:", error);
        }
    });






});



function deleteDepartment(id) {
    // Open the Semantic UI modal
    $('#deleteModal').modal({
        closable: false,
        onApprove: function() {
            // Delete logic here
            $.ajax({
                url: 'api/api_delete_department.php',
                type: 'GET',
                data: {
                    id: id,
                },
                dataType: 'json',
                success: function(response) {
                    if (response.success) {
                        alert('Department deleted successfully.');

                        // Refresh the DataTable or remove the row
                        const table = $('#departmentTable').DataTable();
                        table.row($(`button[onclick="deleteDepartment(${id})"]`).parents('tr')).remove().draw();
                        // Reload the page
                        location.reload();
                    } else {
                        alert('Failed to delete department: ' + response.message);
                    }
                },
                error: function(xhr, status, error) {
                    alert('An error occurred: ' + error);
                }
            });
        }
    }).modal('show');
}



function updateDepartment(id) {
    // Fetch existing data for the department with the given ID from the server
    $.ajax({
        url: 'api/api_get_department_by_id.php',
        type: 'GET',
        data: { id: id },
        dataType: 'json',
        success: function(response) {
            if (response.status === 'success') {
                // Populate the update modal fields with the existing data
                $('#updateName').val(response.data[0].name);
                $('#updateDescription').val(response.data[0].description);
                $('#updateSalary').val(response.data[0].average_salary);

                // Open the update modal
                $('#updateModal').modal({
                    closable: false,
                    onApprove: function() {
                        // Collect the new data from the form
                        const updatedData = {
                            id: id,
                            name: $('#updateName').val(),
                            description: $('#updateDescription').val(),
                            average_salary: $('#updateSalary').val()
                        };

                        // Validate if the average_salary is greater than 0
                        if (updatedData.average_salary <= 0) {
                            alert('Average salary must be greater than 0.');
                            return false; // Prevent the modal from closing
                        }

                        // Send the updated data to the server
                        $.ajax({
                            url: 'api/api_update_department.php',
                            type: 'POST',
                            data: JSON.stringify(updatedData),
                            contentType: "application/json",
                            dataType: 'json',
                            success: function(response) {
                                if (response.status === 'success') {
                                    alert('Department updated successfully.');
                                    location.reload();
                                } else {
                                    alert('Failed to update department: ' + response.message);
                                }
                            },
                            error: function(xhr, status, error) {
                                alert('An error occurred: ' + error);
                            }
                        });
                    }
                }).modal('show');
            } else {
                alert('Failed to fetch department data: ' + response.message);
            }
        },
        error: function(xhr, status, error) {
            alert('An error occurred: ' + error);
        }
    });
}



function showAddDepartmentModal() {
    // Fetch departments, same as in your updateEmployee function
    $.ajax({
        url: 'api/api_get_departments.php',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.status === 'success') {
                const departments = response.data;
                const departmentDropdown = $('#addDepartment');
                departmentDropdown.empty();
                departments.forEach(function(department) {
                    departmentDropdown.append(new Option(department.name, department.name));
                });
                // Show the modal
                $('#addDepartmentModal').modal('show');
            } else {
                alert('Failed to fetch departments: ' + response.message);
            }
        },
        error: function(xhr, status, error) {
            alert('Failed to fetch departments: ' + error);
        }
    });
}

function addDepartment() {
    const newDepartmentData = {
        name: $('#addName').val(),
        description: $('#addDescription').val(),
        salary: $('#addSalary').val(),
    };

    // Check if the salary is greater than 0
    if (newDepartmentData.salary <= 0) {
        alert('Salary must be greater than 0.');
        return false;  // Exit the function if salary is not greater than 0
    }

    // Send the data to your add department API
    $.ajax({
        url: 'api/api_create_department.php',
        type: 'POST',
        data: JSON.stringify(newDepartmentData),
        contentType: "application/json",
        dataType: 'json',
        success: function(response) {
            if (response.status === 'success') {
                alert('Department added successfully.');
                location.reload();
            } else {
                alert('Failed to add department: ' + response.message);
            }
        },
        error: function(xhr, status, error) {
            alert('An error occurred: ' + error);
        }
    });
}


// Function to get URL parameters
function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}
