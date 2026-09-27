# Markdown → Jake's Resume

Un outil gratuit pour écrire son CV en texte simple et le voir mis en page en direct, avec le style du célèbre modèle **Jake's Resume** d'Overleaf.

Pas de compte, pas d'inscription : on écrit à gauche, le CV apparaît à droite.

## Ce que ça fait

- **Aperçu en direct** : chaque modification s'affiche immédiatement dans le CV.
- **Le look Jake's Resume** : même police, mêmes titres soulignés, mêmes dates alignées à droite que le modèle LaTeX d'origine.
- **Export PDF** en un clic, avec un texte lisible par les logiciels de recrutement.
- **Sauvegarde automatique** : votre CV reste enregistré dans votre navigateur, vous le retrouvez en revenant.
- **Libre** : ajoutez vos propres sections, dans la langue de votre choix.

## Comment écrire son CV

Tout en haut, vos coordonnées :

```
---
name: Ryan Lake
phone: 123-456-7890
email: ryan@su.edu
linkedin: linkedin.com/in/ryanlake
github: github.com/ryanlake
---
```

Ensuite, chaque section commence par `##`, et chaque expérience par `###`. Le symbole `|` sépare ce qui va à gauche de ce qui va à droite :

```
## Experience

### Développeur web | Janv. 2023 -- Aujourd'hui
Entreprise | Paris, France
- Une réalisation
- Une autre réalisation
```

Pour les compétences, mettez la catégorie en gras :

```
## Technical Skills

**Langages**: Python, JavaScript, SQL
```

Le CV d'exemple chargé au démarrage montre tous les cas. Le bouton **Réinitialiser** permet d'y revenir à tout moment.

## Confidentialité

Votre CV est enregistré uniquement dans votre navigateur. Lors d'un export PDF, il est envoyé au serveur le temps de créer le fichier, puis oublié : rien n'est conservé.
