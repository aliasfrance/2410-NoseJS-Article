//Importer le module express
const express = require ('express');

//instancier le serveur express/ // Créer l'application Express
const monApp = express();

// Activer la permission d'envoyer des données dans le body des requetes 
// débloque le payload (middleware) dit à l'application oui j'autorise d envoyer les données dans le body
// Middleware pour analyser les requêtes JSON
monApp.use(express.json());

// ----------------------------------------------------------
// * MongoDB
// ----------------------------------------------------------
const mongoose = require('mongoose');
// Si connexion reussie
mongoose.connection.once('open', () => {
    console.log(`Connecté(e) à la base de données`);
});
// Si erreur bdd
mongoose.connection.on('error', (err) => {
    console.log(`Erreur de la base données`);
});
// Enclencher à la connexion
mongoose.connect('mongodb://127.0.0.1:27017/db_article');

// ----------------------------------------------------------
// * Creer le modele article
// 1er param on peut ignorer
// Dernier param = nom de la table
// ----------------------------------------------------------
const Article = mongoose.model('Article', { uuid : String, title : String, content : String, author : String }, 'articles');


// --------------------------------------------------------------
// ROUTES SELECT ALL
// --------------------------------------------------------------

//monApp.get('/articles', (request, response) =>{
    
  // Cas 1 afficher un message:
  //return response.send({message: `Retournera la liste des articles`});
   //return response.json({message: `Retournera la liste des articles`});

  //articles : Retourner la liste des article en JSON
  // On envoie des objets JS 
  //return response.json(articles);
  //});

/*
//cas 2 : Retourner la liste d'article 1
monApp.get('/articles/:id', (request, response) =>{
  //récupérer le paramètre nommé id dans l'url 
  const id = request.params.id;
  return response.json({message: `Retournera l'article ayant l'id ${id}`});
*/
  
// --------------------------------------------------------------
// Partie2 => Retourner un article en JSON
////chercher un article selon un critere don l'ID
// Ne pas oublier de le convertir en entier
// --------------------------------------------------------------

   // A NE PAS FAIRE (code sans le Framework)
   //let articleFound = undefined;
   // Chercher un article selon un critere donc l'id
   // for (const articleIndex of articles)
   // PS : for in =  
   //for (const articleIndex in articles){
   //    const article = articles[articleIndex];
       // Si l'occurance/iteration a le bon id alors j'ai trouvé le bon article
  //     if (article.id == id){
           // Je stocke l'article trouvé
  //         articleFound = article;
   //    }
  // }

 /* A FAIRE : PREDICATE (en java on appel les stream)
 //const article = articles.find(articleIteration => articleIteration.id == id);

 // CAS : Erreur on trouve pas d'article (si il est null)
 if (!article){
     return response.json({message: `Aucun article article trouvé avcec l'id : ${id}`});
 }

 return response.json(article);
});
*/

// --------------------------------------------------------------
// partie 3 : Récupérer tous les articles dans la base de données 
//SELECT ALL
// --------------------------------------------------------------

monApp.get('/articles', async (request, response) => {

    // Récupérer les articles dans la base de données
    const articles = await Article.find();
    // On envoie les articles récupérés en BDD dans la réponsé JSON
    return response.json(articles);

});
  

// --------------------------------------------------------------
 // partie 3 : Récupérer l'article dans la BDD
 //
// --------------------------------------------------------------

monApp.get('/article/:uuid', async (request, response) => {
    // Récupérer le parametre nommé uuid dans l'url
    const uuid = request.params.uuid;
 
    // Récupérer l'article dans la BDD
    const article = await Article.findOne({uuid : uuid});
 
    // CAS : Erreur on trouve pas d'article (si il est null)
    if (!article){
        return response.json({message: `Aucun article article trouvé avec l'id : ${uuid}`});
    }
    return response.json(article);
});



/*
monApp.post('/save-article', (request, response) =>{

    // --------------------------------------------------------------
  // Partie1 => afficher message
  //
  // --------------------------------------------------------------

   return response.json({message: `Va ajouter/modifier un article`});


 // --------------------------------------------------------------
// Partie2 
//save-article : Ajouter ou mettre à jour l'article envoyer depuis le POST dans la liste des articles.
// 
// --------------------------------------------------------------
    // Récupérer l'article envoyé en JSON
    // Exemple : { id: 2, .....}
    const articleJSON = request.body;

    // Comment savoir si c'est un ajout ou un edition ?
    // Si on a un id dans l'article et que en plus l'article existe déjà dans le tableau 
    // ALORS EDITION
    // EN JS: Si ID existe dans le JSON
    if (articleJSON.id) {
        // Forcer l'id entier
        const id = parseInt(articleJSON.id)

        // Si article existe dans le tableau
        // Imaginons JSON = { id: 2, .....}, on va voir si le tableau a un article avec le même id
        const article = articles.find(articleIteration => articleIteration.id == id);
    
        // Si article trouvé avec le même id : MODIFICATION
        if (article){
            // Retrouver l'index tableau
            const articleIndexToEdit = articles.findIndex(articleIteration => articleIteration.id == id);
            
            // Remplacer un element du tableau grace à un index
            articles[articleIndexToEdit] = articleJSON;

            // Retrouver l'index du tableau liée à l'id
            return response.json({message: 'Article modifié avec succès'});
        }
    }

    // PAR DEFAUT => CREATION
    articles.push(articleJSON);
    return response.json({message: `Article ajouté avec succès`});
});

*/

// --------------------------------------------------------------
 // partie 3 : 
 //
// --------------------------------------------------------------

monApp.post('/save-article', async (request, response) => {
    // Récupérer l'article envoyé en JSON
    // Exemple : { id: 2, .....}
    const articleJSON = request.body;

    // Comment savoir si c'est un ajout ou un edition ?
    // Si on a un id dans l'article et que en plus l'article existe déjà dans le tableau 
    // ALORS EDITION
    // EN JS: Si uuid existe dans le JSON
    if (articleJSON.uuid) {
        // Forcer l'id entier
        const uuid = articleJSON.uuid

        // Si article existe dans le tableau
        // Imaginons JSON = { id: 2, .....}, on va voir si le tableau a un article avec le même uuid
        const article = await Article.findOne({uuid: uuid});
    
        // Si article trouvé avec le même id : MODIFICATION
        if (article){

            // Remplacer un element du tableau grace à un index
            article.content = articleJSON.content;
            article.title = articleJSON.title;
            article.author = articleJSON.author;

            // Sauvegarde en base de données
            await article.save();

            // Retrouver l'index du tableau liée à l'id
            return response.json({message: 'Article modifié avec succès'});
        }
    }

    // PAR DEFAUT => CREATION
    // Générer un uuid
    const { v4: uuidv4 } = require('uuid');

    // -- ecraser ou créer le champ uuid dans le json qu'on a récupéré avant de l'inserer en base
    articleJSON.uuid = uuidv4();

    // Sauvegarder en base l'article avec le JSON en question
    await Article.create(articleJSON);

    return response.json({message: `Article ajouté avec succès`});
});


monApp.delete('/articles/:id', (request, response) =>{
  // Récupérer le paramètre nommé id dans l'url
  const id = request.params.id;
    return response.json({message: `Va supprimer l'article ayant l'id ${id}`});

});
/*
 // --------------------------------------------------------------
// Partie2 
///article/:id : Supprimer un article de la liste
// 
// --------------------------------------------------------------
   // Si pas d'id envoyé
   if (!request.params.id) {
    return response.json({message: `L'id est obligatoire`});
}

// Récupérer le parametre nommé id dans l'url
const id = parseInt(request.params.id);

// Pour supprimer on va supprimer grace à l'index
// Donc trouver l'index avec un findIndex predicate id == id
// Retrouver l'index tableau
const articleIndexToDelete = articles.findIndex(articleIteration => articleIteration.id == id);

// CAS: Article pas trouvé
if (articleIndexToDelete == -1){
    return response.json({message: `Impossible de supprimer un article inexistant : ${id}`});
}

// Supprimer un element du tableau à partir Index, Nombre element à supprimer
articles.splice(articleIndexToDelete, 1)

return response.json({message: `Article supprimé avec succès : ${id}`});


*/


// --------------------------------------------------------------
 // partie 3 : 
 //
// --------------------------------------------------------------
monApp.delete('/article/:uuid', async (request, response) => {
    // Si pas d'id envoyé
    if (!request.params.uuid) {
        return response.json({message: `L'uuid est obligatoire`});
    }

    // Récupérer le parametre nommé id dans l'url
    const uuid = request.params.uuid;

    // Pour supprimer on va supprimer grace à l'index
    // Donc trouver l'index avec un findIndex predicate id == id
    // Retrouver l'article qu'on veut supprimer en base
    const article = await Article.findOne({uuid : uuid});

    // CAS: Article pas trouvé
    if (!article){
        return response.json({message: `Impossible de supprimer un article inexistant : ${uuid}`});
    }

  })

// Lancer le serveur
monApp.listen(3000, () => {
  console.log('Serveur démarré sur le port 3000');
});