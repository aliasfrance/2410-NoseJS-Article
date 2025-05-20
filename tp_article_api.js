//Importer le module express
const express = require ('express');

//instancier le serveur express
const app = express();

// Activer la permission d'envoyer des données dans le body des requetes 
// débloque le payload (middleware) dit à l'application oui j'autorise d envoyer les données dans le body
app.use(express.json())

// Cas 1 afficher un message: 
app.get('/articles', (request, response) =>{

    //return response.send({message: `Retournera la liste des articles`});
     return response.json({message: `Retournera la liste des articles`});
   

});

//cas 2 : Retourner la liste d'article 1
app.get('/articles/:id', (request, response) =>{
    //récupérer le paramètre nommé id dans l'url 
    const id = request.params.id;
      return response.json({message: `Retournera l'article ayant l'id ${id}`});

});

app.post('/save-article', (request, response) =>{
     return response.json({message: `Va ajouter/modifier un article`});

});


app.delete('/articles/:id', (request, response) =>{
    // Récupérer le paramètre nommé id dans l'url
    const id = request.params.id;
      return response.json({message: `Va supprimer l'article ayant l'id ${id}`});
   

});

// Lancer le serveur
app.listen(3000);

// mettre un call