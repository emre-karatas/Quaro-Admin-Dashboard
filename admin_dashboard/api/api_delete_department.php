<?php
// Include Database Configuration and CRUD Functions
include '../config/database.php';

// Set HTTP Header to JSON
header('Content-Type: application/json');

// Check if Department ID and Name exist in Request
if (isset($_GET['id'])) {

    $id = $_GET['id'];
    if (deleteDepartment($pdo, $id)) {
        // Record Deleted Successfully
        echo json_encode(["success" => true, "message" => "Department Deleted Successfully"]);
    } else {
        // Record Deletion Failed
        echo json_encode(["success" => false, "message" => "Department Deletion Failed: " . $id]);
    }

} else {
    // No Department ID or Name
    echo json_encode(["success" => false, "message" => "No Department ID or Name provided"]);
}
?>
