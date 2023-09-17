<?php

// Include Database Configuration and CRUD Functions
include '../config/database.php';

// Set HTTP Header to JSON
header('Content-Type: application/json');

try {
    // Fetch All Departments
    $tasks = getAllTasks($pdo);

    // Check if Records Exist
    if (count($tasks) > 0) {
        echo json_encode(['status' => 'success', 'data' => $tasks]);
    } else {
        echo json_encode(['status' => 'success', 'data' => [], 'message' => 'No task found']);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'An error occurred: ' . $e->getMessage()]);
}
