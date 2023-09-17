<?php
// Include Database Configuration and CRUD Functions
include '../config/database.php';

// Set HTTP Header to JSON
header('Content-Type: application/json');

// Check if Employee ID exists in Request
if (isset($_GET['id'])) {

    // Get the Employee ID
    $employee_id = $_GET['id'];

    if (delete_employee($pdo, $employee_id)) {
        // Record Deleted Successfully
        echo json_encode(["success" => true, "message" => "Employee Deleted Successfully"]);
    } else {
        // Record Deletion Failed
        echo json_encode(["success" => false, "message" => "Employee Deletion Failed"]);
    }

} else {
    // No Employee ID
    echo json_encode(["success" => false, "message" => "No Employee ID provided"]);
}
?>
