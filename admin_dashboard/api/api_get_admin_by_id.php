<?php
// Include Database Configuration and CRUD Functions
include '../config/database.php';

// Set HTTP Header to JSON
header('Content-Type: application/json');

// Check if adminID parameter is set and not empty
if (isset($_GET['adminID']) && !empty($_GET['adminID'])) {
    $id = intval($_GET['adminID']);

    try {
        // Check if the function getAdminById exists
        if (function_exists('getAdminById')) {
            // Get admin data
            $admin = getAdminById($pdo, $id);

            // Check if admin data exists
            if ($admin) {
                echo json_encode(['status' => 'success', 'data' => $admin]);
            } else {
                echo json_encode(['status' => 'failure', 'message' => 'No admin found']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Function getAdminById does not exist']);
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
