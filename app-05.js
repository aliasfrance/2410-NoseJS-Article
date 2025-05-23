const express = require('express');
const mongoose = require('mongoose');
const { v4: uuidv4 }  = require('uuid');
const jwt = require('jsonwebtoken');
const {json} = require("express");
const JWT_SECRET = 'SAVOIR_COMPTER_AU_TRIO';
const app = express();
const port = 3000;

// autorise l'accès au body sinon request.body == undefind
app.use(express.json());

// connexion à la bdd MangoDB
mongoose.connect('mongodb://127.0.0.1:27017/db_article')
    .then(() => {
        console.log('BDD connecté');
    })
;
// création du model article depuis MongoDB
const Article = mongoose.model('Article', {uuid: String, title: String, content: String, author: String}, 'articles');
// création du model user depuis MongoDB
const User = mongoose.model('User', {uuid: String, email: String, password: String}, 'users');

// fonction pour log et return
function responseMetier(response, code, message, data = null) {
    console.log(`code: ${code}, message: ${message}`);
    return response.json({code: code, message: message, data: data});
}

// middleware pour valider le token
const authMiddleware = (request, response, next) => {
    // récupère le token envoyer
    const token = request.headers.authorization?.replace('Bearer ', '');
    // si le token n'est pas transmis
    if (!token) {
        return responseMetier(response, 701, `Token non présent`);
    }
    try {
        // vérifi si le token est encore valide
        const decodedToken = jwt.verify(token, JWT_SECRET);
        // logger
        console.log(decodedToken);
        // autorise la suite de traitement soit la route demandé
        next();
    }catch(err) {
        // logger de l'erreur
        console.log(err.message);
        // retourn l'erreur
        return response.json({message: 'Token invalid'});
    }
};


// MIDDLEWARE
const authMiddleware = (request, response, next) => {
    // TESTER QU'ON EST CONNECTE
    const token = request.headers.authorization.replace('Bearer ', '');

    // verifier qu'il est valide
    try {
        const decoded = jwt.verify(token, JWT_SECRET_KEY);
        console.log(decoded);
    // Si erreur jwt (obligé de try catch jwt fait des throw)
    } catch (err){
        console.log(err);
        return response.json({code: "700", message : "Token invalide"});
    }
    // On passe le middleware (on passe le mur)
    next();
}




// route pour lister les articles
app.get('/articles', authMiddleware async (request, response) => {
    // récupère les articles depuis la BDD
    let articles = await Article.find();
    return responseMetier(response, 200, 'La liste des articles a été récupérés avec succès', articles);
});

// route pour afficher un seul article en fonction de son UUID
app.get('/article/:uuid', async (request, response) => {
    // Control de suface
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    // test si l'uuid transmit corresipond au format uuid version 4
    if (!regex.test(request.params.uuid)) {
        return responseMetier(response, 601, 'L\'uuid n\'est pas valide');
    }
    // récupère l'uuid en paramètre de l'URL
    const uuid = request.params.uuid;
    // recherche l'article en fonction de l'uuid récupéré
    const article = await Article.findOne({uuid: uuid});
    // si l'article est trouvé en base
    if (article){
        return responseMetier(response, 200, 'Article récupéré avec succès', article);
    }
    return responseMetier(response, 702, `Impossible de récupérer un article avec l'UID ${uuid}`);
});

// route pour sauvegarder un article (ajouter / modifier)
app.post('/save-article', authMiddleware, async (request, response) => {
    // récupère l'article en paramètre dans le body
    const newArticle = request.body;

    // crée une liste d'erreur potentiel
    let errors = {};
    // si pas de titre dans le body
    if (!newArticle.title) {
        // ajout de l'erreur
        errors.title = "L'article doit comporter un titre";
    }
    // si pas de content dans le body
    if (!newArticle.content) {
        // ajout de l'erreur
        errors.content = "L'article doit comporter un contenu";
    }
    // si pas de author dans le body
    if (!newArticle.author) {
        // ajout de l'erreur
        errors.author = "L'article doit comporter un auteur";
    }
    // test s'il y a des erreurs
    if (Object.keys(errors).length > 0) {
        return responseMetier(response, 710, 'Contrôle de surface non valide', errors);
    }

    // Vérifie s'il existe un autre article avec le même titre
    const testTitre = await Article.findOne({
        title: newArticle.title,
        uuid: { $ne: newArticle.uuid } // exclut l'article lui-même
    });
    // si il y a un autre article avec le même titre
    if (testTitre){
        return responseMetier(response, 701, 'Impossible de modifier un article si un autre article possède un titre similaire', newArticle);
    }
    // si l'uuid est défini c'est une modification
    if (newArticle.uuid) {
        // recherche et sauvegarde l'article en fonction de l'uuid récupéré
        let article = await Article.findOneAndUpdate({uuid: newArticle.uuid} , {
            uuid: newArticle.uuid, title: newArticle.title, content: newArticle.content, author: newArticle.author
        });
        // si l'article est trouvé et update
        if (article) {
            return responseMetier(response, 200, 'Article modifié avec succès', newArticle);
        }
        return responseMetier(response, 701, 'L\'article n\'existe pas');
    }
    // ajout de l'uuid
    newArticle.uuid = uuidv4();
    // ajout de l'article dans la bdd
    await Article.create(newArticle);
    return responseMetier(response, 200, 'Article ajouté', newArticle);
});

// route pour supprimer un article en fonction de son UUID
app.delete('/article/:uuid', authMiddleware, async (request, response) => {
    // récupère l'uuid en paramètre de l'URL
    const uuid = request.params.uuid;
    // recherche l'article en fonction de l'uuid récupéré
    const article = await Article.findOneAndDelete({uuid: uuid});
    // si l'article est trouvé/supprimé en base
    if (article) {
        return responseMetier(response, 200, `L'article ${uuid} a été supprimé avec succès`, article);
    }
    return responseMetier(response, 701, `Impossible de supprimer un article dont l'UID n'existe pas`, article);
});

app.get('/create-token', async (request, response) => {
    // récupère l'email transmis dans le body de la requet
    const emailUser = request.body.email;
    const passUser = request.body.password;
    // si l'email n'est pas transmis
    if (!emailUser) {
        return responseMetier(response, 701, `Email non présent`);
    }
    // si le mot de passe n'est pas transmis
    if (!passUser) {
        return responseMetier(response, 701, `Password non présent`);
    }
    // si l'utilisateur (en bdd) est autorisé
    if (await User.findOne({email: emailUser, password: passUser})) {
        // crée un token à partir d'une adresse email avec une duré de 60 secondes
        const token = jwt.sign({email: emailUser}, JWT_SECRET, {expiresIn: '60d'});
        // retourne le token au user
        return responseMetier(response, 200, `Authentifié(e) avec succès`, token);
    }
    return responseMetier(response, 701, `Vous n'avez pas les permissions`);
});


//-------------------------------------------------
// ce code est reporté dans le middleware en haut
//-------------------------------------------------

// app.post('/verify-token', async (request, response) => {
//     // récupère le token envoyer
//     const token = request.headers.authorization?.replace('Bearer ', '');
//     // si le token n'est pas transmis
//     if (!token) {
//         return responseMetier(response, 701, `Token non présent`);
//     }
//     try {
//         // vérifi si le token est encore valide
//         const decodedToken = jwt.verify(token, JWT_SECRET);
//         // logger
//         console.log(decodedToken);
//         // retourne la l'accèe
//         return response.json({message: `Accès autorisé pour : ${decodedToken.email.split('@')[0]}`});
//     }catch(err) {
//         // logger de l'erreur
//         console.log(err.message);
//         // retourn l'erreur
//         return response.json({message: 'Token invalid'});
//     }
// });

// Démarre le serveur sur le port 3000
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})