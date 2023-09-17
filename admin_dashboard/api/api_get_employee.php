<?php
// Include Database Configuration and CRUD Functions
include '../config/database.php';

// Set HTTP Header to JSON
header('Content-Type: application/json');

if (isset($_GET['id'])) {
    $id = $_GET['id'];

    try {
        $employee = getEmployeeById($pdo, $id);
        if ($employee) {
            echo json_encode(['status' => 'success', 'data' => $employee]);
        } else {
            echo json_encode(['status' => 'success', 'data' => [], 'message' => 'No employee found']);
        }
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
}
else
{
    echo json_encode(['status' => 'error', 'message' => 'Missing employee id']);
}
