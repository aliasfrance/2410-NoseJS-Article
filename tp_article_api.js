//Importer le module express
const express = require ('express');

//instancier le serveur express/ // Créer l'application Express
const monApp = express();

// Activer la permission d'envoyer des données dans le body des requetes 
// débloque le payload (middleware) dit à l'application oui j'autorise d envoyer les données dans le body
// Middleware pour analyser les requêtes JSON
monApp.use(express.json());


// --------------------------------------------------------------
// DATA
// --------------------------------------------------------------
// Simulation de données en mémoire
let articles = [
  { id: 1, title: 'Premier article', content: 'Contenu du premier article', author: 'Isaac' },
  { id: 2, title: 'Deuxième article', content: 'Contenu du deuxième article', author: 'Sanchez' },
  { id: 3, title: 'Troisième article', content: 'Contenu du troisième article', author: 'Toto' }
];


// --------------------------------------------------------------
// ROUTES
// --------------------------------------------------------------

monApp.get('/articles', (request, response) =>{
    
  // Cas 1 afficher un message:
  //return response.send({message: `Retournera la liste des articles`});
   //return response.json({message: `Retournera la liste des articles`});

  //articles : Retourner la liste des article en JSON
  // On envoie des objets JS 
  return response.json(articles);
  
 
});

//cas 2 : Retourner la liste d'article 1
monApp.get('/articles/:id', (request, response) =>{
  //récupérer le paramètre nommé id dans l'url 
  const id = request.params.id;
  return response.json({message: `Retournera l'article ayant l'id ${id}`});

  
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

 // A FAIRE : PREDICATE (en java on appel les stream)
 const article = articles.find(articleIteration => articleIteration.id == id);

 // CAS : Erreur on trouve pas d'article (si il est null)
 if (!article){
     return response.json({message: `Aucun article article trouvé avcec l'id : ${id}`});
 }

 return response.json(article);
});




monApp.post('/save-article', (request, response) =>{
  // --------------------------------------------------------------
  // Partie1 => afficher message
  //
  // --------------------------------------------------------------
   //return response.json({message: `Va ajouter/modifier un article`});


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


monApp.delete('/articles/:id', (request, response) =>{
  // Récupérer le paramètre nommé id dans l'url
  const id = request.params.id;
    return response.json({message: `Va supprimer l'article ayant l'id ${id}`});

});

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

// Lancer le serveur
monApp.listen(3000, () => {
  console.log('Serveur démarré sur le port 3000');
});