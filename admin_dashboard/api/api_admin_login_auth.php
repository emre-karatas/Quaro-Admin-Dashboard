<?php
// Include Database Configuration and CRUD Functions
include '../config/database.php';

// Set HTTP Header to JSON
header('Content-Type: application/json');

try {
    // Fetch input (Assuming POST request)
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    // Fetch Admin using Authentication Function
    $admin_auth = getadminAuth($pdo, $username, $password);

    // Check if Admin Exists
    if ($admin_auth) {
        echo json_encode(['status' => 'success', 'adminID' => $admin_auth['id']]);
    } else {
        echo json_encode(['status' => 'fail', 'message' => 'Invalid username or password']);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'An error occurred: ' . $e->getMessage()]);
}