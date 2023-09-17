<?php
// Include Database Configuration and CRUD Functions
include '../config/database.php';

// Set HTTP Header to JSON
header('Content-Type: application/json');

try {
    // Fetch All Employees
    $employees = getAllEmployees($pdo);

    // Check if Records Exist
    if (count($employees) > 0) {
        echo json_encode(['status' => 'success', 'data' => $employees]);
    } else {
        echo json_encode(['status' => 'success', 'data' => [], 'message' => 'No employees found']);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'An error occurred: ' . $e->getMessage()]);
}
