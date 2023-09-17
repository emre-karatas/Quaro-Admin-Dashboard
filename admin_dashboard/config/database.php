<?php
require_once 'vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$host = $_ENV['DB_HOST'];
$db = $_ENV['DB_NAME'];
$user = $_ENV['DB_USER'];
$password = $_ENV['DB_PASSWORD'];

try {
    // Establish Database Connection
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $password);
} catch (PDOException $e) {
    die("Could not connect: " . $e->getMessage());
}

// Function to fetch all employees
function getAllEmployees($pdo) {
    $sql = "SELECT * FROM employees";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getEmployeeById($pdo, $id) {
    $stmt = $pdo->prepare("SELECT * FROM employees WHERE id = :id");
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function updateEmployee($pdo, $id, $first_name, $last_name, $email, $position, $department_name) {
    try {
        // Start a transaction
        $pdo->beginTransaction();

        // Get the average salary for the department from the 'departments' table
        $sql = "SELECT average_salary FROM departments WHERE name = :department_name";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':department_name', $department_name, PDO::PARAM_STR);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result === false) {
            throw new Exception("Department not found");
        }

        $average_salary = $result['average_salary'];

        // Update the employee in the 'employees' table
        $sql = "UPDATE employees SET first_name = :first_name, last_name = :last_name, email = :email, position = :position, department_name = :department_name, salary = :salary WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':first_name', $first_name, PDO::PARAM_STR);
        $stmt->bindParam(':last_name', $last_name, PDO::PARAM_STR);
        $stmt->bindParam(':email', $email, PDO::PARAM_STR);
        $stmt->bindParam(':position', $position, PDO::PARAM_STR);
        $stmt->bindParam(':department_name', $department_name, PDO::PARAM_STR);
        $stmt->bindParam(':salary', $average_salary, PDO::PARAM_INT);

        // Execute the statement
        $result = $stmt->execute();

        // Commit the transaction
        $pdo->commit();

        return $result;
    } catch (Exception $e) {
        // Rollback the transaction in case of errors
        $pdo->rollBack();
        return false;
    }
}


function getDepartmentSalaries($pdo)
{
    $sql = "SELECT average_salary FROM departments";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function delete_employee($pdo, $id) {
    $stmt = $pdo->prepare("DELETE FROM employees WHERE id = :id");
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    return $stmt->execute();
}

function getDepartments($pdo)
{
    $stmt = $pdo->prepare("SELECT name, id FROM departments");
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);

}

function createEmployee($pdo, $first_name, $last_name, $email, $position, $department_name) {
    try {
        // Start a transaction
        $pdo->beginTransaction();

        // Get the average salary and department_id for the department from the 'departments' table
        $sql = "SELECT id, average_salary FROM departments WHERE name = :department_name";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':department_name', $department_name, PDO::PARAM_STR);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result === false) {
            throw new Exception("Department not found");
        }

        $average_salary = $result['average_salary'];
        $department_id = $result['id'];  // Fetching department_id

        // Insert the new employee into the 'employees' table
        $sql = "INSERT INTO employees (first_name, last_name, email, position, department_name, department_id, salary) VALUES (:first_name, :last_name, :email, :position, :department_name, :department_id, :salary)";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':first_name', $first_name, PDO::PARAM_STR);
        $stmt->bindParam(':last_name', $last_name, PDO::PARAM_STR);
        $stmt->bindParam(':email', $email, PDO::PARAM_STR);
        $stmt->bindParam(':position', $position, PDO::PARAM_STR);
        $stmt->bindParam(':department_name', $department_name, PDO::PARAM_STR);
        $stmt->bindParam(':department_id', $department_id, PDO::PARAM_INT); // Binding department_id
        $stmt->bindParam(':salary', $average_salary, PDO::PARAM_INT);

        // Execute the statement
        $result = $stmt->execute();

        // Commit the transaction
        $pdo->commit();

        return $result;
    } catch (Exception $e) {
        // Rollback the transaction in case of errors
        $pdo->rollBack();
        return false;
    }
}




// Function to authenticate an admin
function getadminAuth($pdo, $username, $password) {
    $sql = "SELECT * FROM admins WHERE username = :username";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':username', $username, PDO::PARAM_STR);
    $stmt->execute();
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($admin && $admin['password'] == $password) {
        // Update the last login time
        $sql = "UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':id', $admin['id'], PDO::PARAM_INT);
        $stmt->execute();
        return $admin;
    }
    return null;
}

function getAdminById($pdo, $id) {
    $stmt = $pdo->prepare("SELECT *  FROM admins WHERE id = :id");
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Function to fetch all employees
function getAllDepartments($pdo) {
    $sql = "SELECT * FROM departments";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function createDepartment($pdo, $name, $description, $average_salary) {
    $sql = "INSERT INTO departments (name, description, average_salary ) VALUES (:name, :description, :average_salary)";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':name', $name, PDO::PARAM_STR);
    $stmt->bindParam(':description', $description, PDO::PARAM_STR);
    $stmt->bindParam(':average_salary', $average_salary, PDO::PARAM_INT);

    return $stmt->execute();
}

function getDepartmentById($pdo, $id) {
    $stmt = $pdo->prepare("SELECT *  FROM departments WHERE id = :id");
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function updateDepartment($pdo, $id, $name, $description, $average_salary) {
    // Begin a transaction
    $pdo->beginTransaction();

    try {
        // First, update the employees in this department based on department_id
        $stmt = $pdo->prepare("UPDATE employees SET salary = :average_salary, department_name = :name WHERE department_id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':name', $name, PDO::PARAM_STR);
        $stmt->bindParam(':average_salary', $average_salary, PDO::PARAM_INT);
        $stmt->execute();

        // Then, update the department itself
        $stmt = $pdo->prepare("UPDATE departments SET name = :name, description = :description, average_salary = :average_salary WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':name', $name, PDO::PARAM_STR);
        $stmt->bindParam(':description', $description, PDO::PARAM_STR);
        $stmt->bindParam(':average_salary', $average_salary, PDO::PARAM_INT);
        $stmt->execute();

        // Commit the transaction
        $pdo->commit();

    } catch (Exception $e) {
        // Something went wrong, roll back!
        $pdo->rollBack();
        throw $e;
    }
}





// Function to fetch all employees
function getAllTasks($pdo) {
    $sql = "SELECT * FROM tasks";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function createTask($pdo, $employee_id, $description, $deadline, $status)
{
    $sql = "INSERT INTO tasks (employee_id, description, deadline, status) VALUES (:employee_id, :description, :deadline, :status)";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':employee_id', $employee_id, PDO::PARAM_STR);
    $stmt->bindParam(':description', $description, PDO::PARAM_STR);
    $stmt->bindParam(':deadline', $deadline, PDO::PARAM_STR);
    $stmt->bindParam(':status', $status, PDO::PARAM_STR);
    return $stmt->execute();
}

function getTaskById($pdo, $id) {
    $stmt = $pdo->prepare("SELECT * FROM tasks WHERE id = :id");
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function deleteDepartment($pdo, $id): bool
{
    try {
        // Begin a transaction
        $pdo->beginTransaction();

        // First, delete all related employees in that department based on the department_id
        $sql = "DELETE FROM employees WHERE department_id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        if (!$stmt->execute()) {
            throw new Exception("Failed to delete employees for department ID: " . $id);
        }

        // Next, delete the department itself
        $sql = "DELETE FROM departments WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        if (!$stmt->execute()) {
            throw new Exception("Failed to delete department ID: " . $id);
        }

        // Commit the transaction
        $pdo->commit();
        return true;
    } catch (Exception $e) {
        // If an error occurs, rollback the transaction
        $pdo->rollBack();
        error_log("Error while deleting department: " . $e->getMessage());
        return false;
    }
}














