<?php
// Include Database Configuration and CRUD Functions
include '../config/database.php';

// Set HTTP Header to JSON
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (isset($data['id'], $data['first_name'], $data['last_name'], $data['email'], $data['position'], $data['department_name'])) {
        try {
            updateEmployee($pdo, $data['id'], $data['first_name'], $data['last_name'], $data['email'], $data['position'], $data['department_name']);
            echo json_encode(['status' => 'success', 'message' => 'Employee updated successfully']);
        } catch (PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Missing fields']);
    }
}
