<?php
// Include Database Configuration and CRUD Functions
include '../config/database.php';

// Set HTTP Header to JSON
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // For debugging: Log POST data
    error_log(print_r($_POST, true));

    // Check if the POST data is JSON formatted
    $isJson = strpos($_SERVER["CONTENT_TYPE"], "application/json") !== false;

    if ($isJson) {
        // If the content type is JSON, read from php://input
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
    } else {
        // If not, use the standard POST array
        $data = $_POST;
    }

    if (isset($data['first_name'], $data['last_name'], $data['email'], $data['position'], $data['department_name'])) {
        $first_name = trim($data['first_name']);
        $last_name = trim($data['last_name']);
        $email = trim($data['email']);
        $position = trim($data['position']);
        $department_name = trim($data['department_name']);

        if ($first_name && $last_name && $email && $position && $department_name) {
            try {
                $result = createEmployee($pdo, $first_name, $last_name, $email, $position, $department_name);
                if ($result) {
                    echo json_encode(['status' => 'success', 'message' => 'Employee created']);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Failed to create employee']);
                }
            } catch (PDOException $e) {
                echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Invalid or incomplete fields']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Missing fields']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}
?>
