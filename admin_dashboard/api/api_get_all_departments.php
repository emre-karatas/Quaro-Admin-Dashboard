<?php
// Include Database Configuration and CRUD Functions
include '../config/database.php';

// Set HTTP Header to JSON
header('Content-Type: application/json');

try {
    // Fetch All Departments
    $departments = getAllDepartments($pdo);

    // Check if Records Exist
    if (count($departments) > 0) {
        echo json_encode(['status' => 'success', 'data' => $departments]);
    } else {
        echo json_encode(['status' => 'success', 'data' => [], 'message' => 'No department found']);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'An error occurred: ' . $e->getMessage()]);
}
