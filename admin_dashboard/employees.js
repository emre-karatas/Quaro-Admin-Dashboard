$(document).ready(function() {
    const table = $('#employeeTable').DataTable();
    const departmentDistribution = {};
    const positionDistribution = {};


    const adminID = getURLParameter('adminID');


    if (!adminID) {
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


    showDepartmentChart();

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


    // Fetch data for salary bar chart
    $.ajax({
        url: 'api/api_get_department_salaries.php',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.status === 'success') {
                const categories = response.data.map(d => d.name);
                const data = response.data.map(d => d.average_salary);
                initBarChart('salaryBarChart', 'Department Salaries', categories, data);
            } else {
                console.error("Received non-success status:", response.status);
            }
        },
        error: function(xhr, status, error) {
            console.error("An error occurred:", error);
        }
    });

    // Fetch data from the server
    $.ajax({
        url: 'api/api_get_all_employees.php',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.status === 'success') {
                response.data.forEach(employee => {
                    // Populate the DataTable
                    table.row.add([
                        employee.id,
                        employee.first_name,
                        employee.last_name,
                        employee.email,
                        employee.position,
                        employee.department_name,
                        employee.salary,
                        `<div class="ui mini buttons">
                            <button class="ui green icon button" onclick="updateEmployee(${employee.id})">
                                <i class="edit icon"></i>
                            </button>
                            <button class="ui red icon button" onclick="deleteEmployee(${employee.id})">
                                <i class="trash icon"></i>
                            </button>
                        </div>`
                    ]).draw(false);

                    // Update distribution counters
                    departmentDistribution[employee.department_name] = (departmentDistribution[employee.department_name] || 0) + 1;
                    positionDistribution[employee.position] = (positionDistribution[employee.position] || 0) + 1;
                });

                // Prepare and initialize the department distribution chart
                const departmentChartData = Object.entries(departmentDistribution).map(([name, y]) => ({ name, y }));
                initPieChart('departmentChart', 'Department Distribution', departmentChartData);

                // Prepare and initialize the position distribution chart
                const positionChartData = Object.entries(positionDistribution).map(([name, y]) => ({ name, y }));
                initPieChart('positionChart', 'Position Distribution', positionChartData);

            } else {
                console.error("Received non-success status:", response.status);
            }
        },
        error: function(xhr, status, error) {
            console.error("An error occurred:", error);
        }
    });




});


function showDepartmentChart() {
    document.getElementById("departmentChart").style.display = "block";
    document.getElementById("positionChart").style.display = "none";

}

function showPositionChart() {
    document.getElementById("departmentChart").style.display = "none";
    document.getElementById("positionChart").style.display = "block";
}



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


function updateEmployee(id) {
    // Fetch the list of departments from the server
    $.ajax({
        url: 'api/api_get_departments.php',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.status === 'success') {
                const departments = response.data;
                const departmentDropdown = $('#updateDepartment');
                departmentDropdown.empty();
                departments.forEach(function(department) {
                    departmentDropdown.append(new Option(department.name, department.name));
                });

                // Fetch existing data for the employee with the given ID from the server
                $.ajax({
                    url: 'api/api_get_employee.php',
                    type: 'GET',
                    data: { id: id },
                    dataType: 'json',
                    success: function(response) {
                        if (response.status === 'success') {
                            // Populate the update modal fields with the existing data
                            $('#updateFirstName').val(response.data.first_name);
                            $('#updateLastName').val(response.data.last_name);
                            $('#updateEmail').val(response.data.email);
                            $('#updatePosition').val(response.data.position);
                            $('#updateDepartment').val(response.data.department_name);

                            // Open the update modal
                            $('#updateModal').modal({
                                closable: false,
                                onApprove: function() {
                                    // Collect the new data from the form
                                    const updatedData = {
                                        id: id,
                                        first_name: $('#updateFirstName').val(),
                                        last_name: $('#updateLastName').val(),
                                        email: $('#updateEmail').val(),
                                        position: $('#updatePosition').val(),
                                        department_name: $('#updateDepartment').val(),
                                    };
                                    console.log(updatedData);

                                    // Send the updated data to the server
                                    $.ajax({
                                        url: 'api/api_update_employee.php',
                                        type: 'POST',
                                        data: JSON.stringify(updatedData),  // Convert object to JSON string
                                        contentType: "application/json",    // Explicitly set the content type to JSON
                                        dataType: 'json',
                                        success: function(response) {
                                            if (response.status === 'success') {
                                                alert('Employee updated successfully.');
                                                location.reload();
                                            } else {
                                                alert('Failed to update employee: ' + response.message);
                                            }
                                        },
                                        error: function(xhr, status, error) {
                                            alert('An error occurred: ' + error);
                                        }
                                    });
                                }
                            }).modal('show');
                        } else {
                            alert('Failed to fetch employee data: ' + response.message);
                        }
                    },
                    error: function(xhr, status, error) {
                        alert('An error occurred: ' + error);
                    }
                });
            } else {
                alert('Failed to fetch departments: ' + response.message);
            }
        },
        error: function(xhr, status, error) {
            alert('Failed to fetch departments: ' + error);
        }
    });
}

function showAddEmployeeModal() {
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
                $('#addEmployeeModal').modal('show');
            } else {
                alert('Failed to fetch departments: ' + response.message);
            }
        },
        error: function(xhr, status, error) {
            alert('Failed to fetch departments: ' + error);
        }
    });
}

function addEmployee() {
    const newEmployeeData = {
        first_name: $('#addFirstName').val(),
        last_name: $('#addLastName').val(),
        email: $('#addEmail').val(),
        position: $('#addPosition').val(),
        department_name: $('#addDepartment').val(),
    };

    // Send the data to your add employee API
    $.ajax({
        url: 'api/api_create_employee.php',
        type: 'POST',
        data: JSON.stringify(newEmployeeData),
        contentType: "application/json",
        dataType: 'json',
        success: function(response) {
            if (response.status === 'success') {
                alert('Employee added successfully.');
                location.reload();
            } else {
                alert('Failed to add employee: ' + response.message);
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

