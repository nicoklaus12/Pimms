<?php
/**
 * Script de migration pour ajouter les colonnes manquantes
 * À exécuter si vous avez déjà créé la base de données
 * Accéder via : http://localhost/pimms/migrate-database.php
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Migration Base de Données - Pimms Médiation</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .success { background-color: #d4edda; color: #155724; padding: 10px; margin: 5px 0; border-radius: 5px; border: 1px solid #c3e6cb; }
        .error { background-color: #f8d7da; color: #721c24; padding: 10px; margin: 5px 0; border-radius: 5px; border: 1px solid #f5c6cb; }
        .warning { background-color: #fff3cd; color: #856404; padding: 10px; margin: 5px 0; border-radius: 5px; border: 1px solid #ffeaa7; }
        .info { background-color: #d1ecf1; color: #0c5460; padding: 10px; margin: 5px 0; border-radius: 5px; border: 1px solid #bee5eb; }
    </style>
</head>
<body>
    <div class="container mt-5">
        <div class="row">
            <div class="col-md-10 offset-md-1">
                <div class="card shadow">
                    <div class="card-header bg-warning text-dark">
                        <h2 class="mb-0">🔄 Migration de la Base de Données</h2>
                    </div>
                    <div class="card-body">
                        <?php
                        $host = 'localhost';
                        $username = 'root';
                        $password = '';
                        $dbname = 'pimms_mediation';
                        
                        try {
                            // Connexion à MySQL
                            $pdo = new PDO("mysql:host=$host;charset=utf8", $username, $password);
                            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                            
                            echo "<div class='success'>✅ Connexion à MySQL réussie</div>";
                            
                            // Vérifier si la base de données existe
                            $stmt = $pdo->query("SHOW DATABASES LIKE '$dbname'");
                            if ($stmt->rowCount() == 0) {
                                echo "<div class='error'>❌ La base de données '$dbname' n'existe pas.</div>";
                                echo "<div class='info'>💡 Exécutez d'abord <a href='create-database.php'>create-database.php</a></div>";
                                exit;
                            }
                            
                            echo "<div class='success'>✅ Base de données '$dbname' trouvée</div>";
                            
                            // Sélectionner la base de données
                            $pdo->exec("USE $dbname");
                            
                            // Vérifier si la table visitors existe
                            $stmt = $pdo->query("SHOW TABLES LIKE 'visitors'");
                            if ($stmt->rowCount() == 0) {
                                echo "<div class='error'>❌ La table 'visitors' n'existe pas.</div>";
                                echo "<div class='info'>💡 Exécutez <a href='create-database.php'>create-database.php</a> pour créer la table</div>";
                                exit;
                            }
                            
                            echo "<div class='success'>✅ Table 'visitors' trouvée</div>";
                            
                            // Vérifier les colonnes existantes
                            $stmt = $pdo->query("DESCRIBE visitors");
                            $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
                            
                            echo "<div class='info'><strong>Colonnes actuelles :</strong> " . implode(', ', $columns) . "</div>";
                            
                            $migrations = [];
                            
                            // Ajouter la colonne priorite si elle n'existe pas
                            if (!in_array('priorite', $columns)) {
                                try {
                                    $pdo->exec("ALTER TABLE visitors ADD COLUMN priorite VARCHAR(20) DEFAULT NULL AFTER motif");
                                    $migrations[] = "Colonne 'priorite' ajoutée";
                                    echo "<div class='success'>✅ Colonne 'priorite' ajoutée</div>";
                                } catch (PDOException $e) {
                                    echo "<div class='error'>❌ Erreur lors de l'ajout de 'priorite': " . $e->getMessage() . "</div>";
                                }
                            } else {
                                echo "<div class='info'>ℹ️ Colonne 'priorite' existe déjà</div>";
                            }
                            
                            // Ajouter la colonne heure_rdv si elle n'existe pas
                            if (!in_array('heure_rdv', $columns)) {
                                try {
                                    $pdo->exec("ALTER TABLE visitors ADD COLUMN heure_rdv TIME DEFAULT NULL AFTER priorite");
                                    $migrations[] = "Colonne 'heure_rdv' ajoutée";
                                    echo "<div class='success'>✅ Colonne 'heure_rdv' ajoutée</div>";
                                } catch (PDOException $e) {
                                    echo "<div class='error'>❌ Erreur lors de l'ajout de 'heure_rdv': " . $e->getMessage() . "</div>";
                                }
                            } else {
                                echo "<div class='info'>ℹ️ Colonne 'heure_rdv' existe déjà</div>";
                            }
                            
                            // Mettre à jour le statut pour inclure 'Terminé' au lieu de 'Fait'
                            try {
                                $pdo->exec("ALTER TABLE visitors MODIFY COLUMN statut ENUM('En attente', 'Reçu', 'Terminé') DEFAULT 'En attente'");
                                echo "<div class='success'>✅ Colonne 'statut' mise à jour</div>";
                            } catch (PDOException $e) {
                                // Ignorer si déjà à jour
                                if (strpos($e->getMessage(), 'Duplicate') === false) {
                                    echo "<div class='warning'>⚠️ Note sur 'statut': " . $e->getMessage() . "</div>";
                                }
                            }
                            
                            // Afficher le résultat final
                            echo "<hr>";
                            if (count($migrations) > 0) {
                                echo "<div class='alert alert-success'><h4>✅ Migration terminée avec succès !</h4>";
                                echo "<p><strong>Modifications effectuées :</strong></p><ul>";
                                foreach ($migrations as $migration) {
                                    echo "<li>$migration</li>";
                                }
                                echo "</ul>";
                                echo "<p><a href='test-xampp.php' class='btn btn-primary'>Vérifier la configuration</a> ";
                                echo "<a href='index.html' class='btn btn-success'>Accéder à l'application</a></p></div>";
                            } else {
                                echo "<div class='alert alert-info'><h4>ℹ️ Aucune migration nécessaire</h4>";
                                echo "<p>La base de données est déjà à jour.</p>";
                                echo "<p><a href='index.html' class='btn btn-primary'>Accéder à l'application</a></p></div>";
                            }
                            
                        } catch (PDOException $e) {
                            echo "<div class='error'><h4>❌ Erreur de migration</h4>";
                            echo "<p>" . $e->getMessage() . "</p>";
                            echo "<p>Vérifiez que MySQL est démarré dans XAMPP</p></div>";
                        }
                        ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>





