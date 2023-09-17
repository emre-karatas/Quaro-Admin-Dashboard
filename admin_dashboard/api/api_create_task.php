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

    if (isset($data['employee_id'],$data['description'], $data['deadline'], $data['status'])) {
        $employee_id = trim($data['employee_id']);
        $description = trim($data['description']);
        $deadline = trim($data['deadline']);
        $status = trim($data['status']);


        if ( $employee_id && $description && $deadline && $status ) {
            try {
                $result = createTask($pdo, $employee_id, $description, $deadline, $status);
                if ($result) {
                    echo json_encode(['status' => 'success', 'message' => 'Task created']);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Failed to create task.']);
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
