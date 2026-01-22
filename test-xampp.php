<?php
/**
 * Script de test pour vérifier la configuration XAMPP
 * Accéder via : http://localhost/pimms/test-xampp.php
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Configuration XAMPP - Pimms Médiation</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .test-result { padding: 10px; margin: 5px 0; border-radius: 5px; }
        .success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .warning { background-color: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
        .info { background-color: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
    </style>
</head>
<body>
    <div class="container mt-5">
        <div class="row">
            <div class="col-md-10 offset-md-1">
                <div class="card shadow">
                    <div class="card-header bg-primary text-white">
                        <h2 class="mb-0">🔍 Test de Configuration XAMPP - Pimms Médiation</h2>
                    </div>
                    <div class="card-body">
                        <?php
                        $allTestsPassed = true;
                        
                        // Test 1: Version PHP
                        echo "<h4>1. Version PHP</h4>";
                        $phpVersion = phpversion();
                        if (version_compare($phpVersion, '7.4.0', '>=')) {
                            echo "<div class='test-result success'>✅ PHP $phpVersion installé (Version requise: 7.4+)</div>";
                        } else {
                            echo "<div class='test-result error'>❌ PHP $phpVersion installé (Version requise: 7.4+)</div>";
                            $allTestsPassed = false;
                        }
                        
                        // Test 2: Extension PDO
                        echo "<h4>2. Extension PDO</h4>";
                        if (extension_loaded('pdo')) {
                            echo "<div class='test-result success'>✅ Extension PDO chargée</div>";
                        } else {
                            echo "<div class='test-result error'>❌ Extension PDO non chargée</div>";
                            $allTestsPassed = false;
                        }
                        
                        // Test 3: Extension PDO MySQL
                        echo "<h4>3. Extension PDO MySQL</h4>";
                        if (extension_loaded('pdo_mysql')) {
                            echo "<div class='test-result success'>✅ Extension PDO MySQL chargée</div>";
                        } else {
                            echo "<div class='test-result error'>❌ Extension PDO MySQL non chargée</div>";
                            $allTestsPassed = false;
                        }
                        
                        // Test 4: Connexion MySQL
                        echo "<h4>4. Connexion à MySQL</h4>";
                        try {
                            $host = 'localhost';
                            $username = 'root';
                            $password = '';
                            
                            $pdo = new PDO("mysql:host=$host;charset=utf8", $username, $password);
                            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                            echo "<div class='test-result success'>✅ Connexion à MySQL réussie</div>";
                            
                            // Test 5: Base de données existe
                            echo "<h4>5. Base de données 'pimms_mediation'</h4>";
                            $stmt = $pdo->query("SHOW DATABASES LIKE 'pimms_mediation'");
                            if ($stmt->rowCount() > 0) {
                                echo "<div class='test-result success'>✅ Base de données 'pimms_mediation' existe</div>";
                                
                                // Test 6: Tables existent
                                echo "<h4>6. Tables de la base de données</h4>";
                                $pdo->exec("USE pimms_mediation");
                                $tables = ['users', 'visitors', 'sessions'];
                                $allTablesExist = true;
                                
                                foreach ($tables as $table) {
                                    $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
                                    if ($stmt->rowCount() > 0) {
                                        $count = $pdo->query("SELECT COUNT(*) FROM $table")->fetchColumn();
                                        echo "<div class='test-result success'>✅ Table '$table' existe ($count enregistrements)</div>";
                                    } else {
                                        echo "<div class='test-result error'>❌ Table '$table' n'existe pas</div>";
                                        $allTablesExist = false;
                                        $allTestsPassed = false;
                                    }
                                }
                                
                                // Test 7: Utilisateurs par défaut
                                echo "<h4>7. Utilisateurs par défaut</h4>";
                                $stmt = $pdo->query("SELECT username, role FROM users");
                                $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
                                if (count($users) > 0) {
                                    echo "<div class='test-result success'>✅ Utilisateurs trouvés :</div>";
                                    echo "<ul>";
                                    foreach ($users as $user) {
                                        echo "<li><strong>{$user['username']}</strong> ({$user['role']})</li>";
                                    }
                                    echo "</ul>";
                                } else {
                                    echo "<div class='test-result warning'>⚠️ Aucun utilisateur trouvé</div>";
                                }
                                
                            } else {
                                echo "<div class='test-result error'>❌ Base de données 'pimms_mediation' n'existe pas</div>";
                                echo "<div class='test-result info'>💡 Exécutez <a href='create-database.php'>create-database.php</a> pour créer la base de données</div>";
                                $allTestsPassed = false;
                            }
                            
                        } catch (PDOException $e) {
                            echo "<div class='test-result error'>❌ Erreur de connexion MySQL : " . $e->getMessage() . "</div>";
                            echo "<div class='test-result warning'>⚠️ Vérifiez que MySQL est démarré dans XAMPP</div>";
                            $allTestsPassed = false;
                        }
                        
                        // Test 8: Fichiers API
                        echo "<h4>8. Fichiers API</h4>";
                        $apiFiles = [
                            'api/config.php',
                            'api/auth.php',
                            'api/users.php',
                            'api/visitors.php'
                        ];
                        $allFilesExist = true;
                        foreach ($apiFiles as $file) {
                            if (file_exists($file)) {
                                echo "<div class='test-result success'>✅ $file existe</div>";
                            } else {
                                echo "<div class='test-result error'>❌ $file n'existe pas</div>";
                                $allFilesExist = false;
                                $allTestsPassed = false;
                            }
                        }
                        
                        // Test 9: Permissions d'écriture
                        echo "<h4>9. Permissions</h4>";
                        if (is_writable('.')) {
                            echo "<div class='test-result success'>✅ Permissions d'écriture OK</div>";
                        } else {
                            echo "<div class='test-result warning'>⚠️ Permissions d'écriture limitées</div>";
                        }
                        
                        // Résultat final
                        echo "<hr>";
                        if ($allTestsPassed) {
                            echo "<div class='alert alert-success'><h4>✅ Tous les tests sont passés avec succès !</h4>";
                            echo "<p>L'application est prête à être utilisée.</p>";
                            echo "<a href='index.html' class='btn btn-primary'>Accéder à l'application</a></div>";
                        } else {
                            echo "<div class='alert alert-danger'><h4>❌ Certains tests ont échoué</h4>";
                            echo "<p>Veuillez corriger les erreurs ci-dessus avant de continuer.</p>";
                            echo "<ul>";
                            echo "<li>Vérifiez que <strong>Apache</strong> et <strong>MySQL</strong> sont démarrés dans XAMPP</li>";
                            echo "<li>Exécutez <a href='create-database.php'>create-database.php</a> pour créer la base de données</li>";
                            echo "<li>Vérifiez les paramètres dans <code>api/config.php</code></li>";
                            echo "</ul></div>";
                        }
                        ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>





