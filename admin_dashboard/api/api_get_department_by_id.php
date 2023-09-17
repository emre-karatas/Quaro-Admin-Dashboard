<?php
// Include Database Configuration and CRUD Functions
include '../config/database.php';

// Set HTTP Header to JSON
header('Content-Type: application/json');

// Check if adminID parameter is set and not empty
if (isset($_GET['id']) && !empty($_GET['id'])) {
    $id = intval($_GET['id']);  // Cast to integer for security

    try {
        // Check if the function getAdminById exists
        if (function_exists('getDepartmentById')) {
            // Get admin data
            $department = getDepartmentById($pdo, $id);

            // Check if admin data exists
            if ($department) {
                echo json_encode(['status' => 'success', 'data' => $department]);
            } else {
                echo json_encode(['status' => 'failure', 'message' => 'No department found']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Function getDepartmentById does not exist']);
        }
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'An error occurred: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Missing or empty admin id']);
}
?>
