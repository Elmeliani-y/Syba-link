import express from 'express';
import mysql from 'mysql';
import sharp from 'sharp';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import multer from 'multer';


const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials:true
}));
app.use(express.json());
app.use(cookieParser())
app.use(bodyParser.json());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge:1000*60*60*24
    }
}))

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nticsybav3'
})

app.post('/signup', (req, res) => {
    const sql = "INSERT INTO `userprofile` (`nom`, `prenom`, `nickname`, `email`, `password`) VALUES (?)";
    const values = [
        req.body.first_name,
        req.body.last_name,
        req.body.nickname,
        req.body.email,
        req.body.password
    ];
    console.log(values);
    db.query(sql, [values], (err, data) => {
        if (err) {
            console.error('MySQL Error:', err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        return res.status(201).json({ message: "User created successfully" });
    });
});


app.post('/login', (req, res) => {
    const sql = "SELECT * FROM `userprofile` WHERE `email`=? AND `password`=?";
    console.log(req.body.email);
    console.log(req.body.password);
    db.query(sql, [req.body.email, req.body.password], (err, data) => {
        if (err) {
            console.error('MySQL Error:', err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        if (data.length > 0) {
            req.session.onlineuser=data[0].userId;
            return res.status(200).json({message:"sucsses",user:data[0].userId});
        } else {
            return res.status(200).json({message:"failure"});
        }
    });
});
app.get('/stories', (req, res) => {
    const userId = req.session.onlineuser;

    const sql = `
        SELECT story.storyId, story.userId, story.content, story.contentimg, userprofile.nickname, userprofile.profilePicture
        FROM story
        JOIN userprofile ON story.userId = userprofile.userId
        WHERE story.userId = ? OR story.userId IN (
            SELECT followed_id
            FROM followers
            WHERE follower_id = ?
        )`;

    db.query(sql, [userId, userId], (err, data) => {
        if (err) {
            console.error('MySQL Error:', err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        
        const storiesWithBase64 = data.map(story => {
            if (story.contentimg) {
                story.contentimg = `data:image/png;base64,${Buffer.from(story.contentimg, 'binary').toString('base64')}`;
            }
            if (story.profilePicture) {
                story.profilePicture = `data:image/png;base64,${Buffer.from(story.profilePicture, 'binary').toString('base64')}`;
            }
            return story;
        });
        return res.status(200).json(storiesWithBase64);
    });
});


app.get('/posts', (req, res) => {
    const userId = req.session.onlineuser;

    const sql = `
        SELECT post.postId, 
               post.userId, 
               post.datePosted, 
               post.content, 
               post.contentimg, 
               userprofile.nickname, 
               userprofile.profilePicture, 
               COUNT(DISTINCT comment.commentId) AS commentCount,
               COUNT(DISTINCT likes.likeId) AS likeCount,
               MAX(CASE WHEN likes.userId = ? THEN 1 ELSE 0 END) AS isLikedByCurrentUser
        FROM post 
        JOIN userprofile ON post.userId = userprofile.userId
        LEFT JOIN comment ON post.postId = comment.postId
        LEFT JOIN likes ON post.postId = likes.postId
        WHERE post.userId = ? OR EXISTS (
            SELECT 1
            FROM followers
            WHERE post.userId = followers.followed_id
            AND followers.follower_id = ?
        )
        GROUP BY post.postId;`;

    db.query(sql, [userId, userId, userId], (err, data) => {
        if (err) {
            console.error('MySQL Error:', err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        
        const postsWithBase64 = data.map(post => {
            if (post.contentimg) {
                post.contentimg = Buffer.from(post.contentimg, 'binary').toString('base64');
            }
            if (post.profilePicture) {
                post.profilePicture = `data:image/png;base64,${Buffer.from(post.profilePicture, 'binary').toString('base64')}`;
            }
            return post;
        });
        return res.status(200).json(postsWithBase64);
    });
});





const upload = multer();

app.post('/addstory', upload.single('image'), (req, res) => {
    const userId = req.session.onlineuser;
    const { content } = req.body;
    const image = req.file.buffer;

    const sql = "INSERT INTO `story` (`userId`, `content`, `contentimg`, `datePosted`) VALUES (?, ?, ?, NOW())";
    const values = [userId, content, image];

    db.query(sql, values, (err, data) => {
        if (err) {
            console.error('MySQL Error:', err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        return res.status(201).json({ message: "Story added successfully" });
    });
});



app.get('/comments/:postId', (req, res) => {
    const { postId } = req.params;
    console.log(`Fetching comments for post: ${postId}`);

    // First query to fetch comments with user details
    const commentSql = `
        SELECT comment.commentId,
               comment.userId,
               comment.content,
               userprofile.nickname,
               userprofile.profilePicture
        FROM comment
        JOIN userprofile ON comment.userId = userprofile.userId
        WHERE comment.postId = ?`;

    db.query(commentSql, [postId], (err, commentResults) => {
        if (err) {
            console.error('MySQL Error:', err);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        // Convert profile pictures to base64
        const transformedComments = commentResults.map(row => {
            if (row.profilePicture) {
                row.profilePicture = `data:image/png;base64,${Buffer.from(row.profilePicture, 'binary').toString('base64')}`;
            }
            return row;
        });

        // Second query to fetch the post image
        const postImageSql = `
            SELECT contentimg 
            FROM post 
            WHERE postId = ?`;

        db.query(postImageSql, [postId], (err, postImageResults) => {
            if (err) {
                console.error('Error fetching post image:', err);
                return res.status(500).json({ error: 'Erreur lors de la récupération de l\'image du post' });
            }

            let postImage = null;
            if (postImageResults.length > 0 && postImageResults[0].contentimg) {
                postImage = `data:image/jpeg;base64,${Buffer.from(postImageResults[0].contentimg, 'binary').toString('base64')}`;
            }

            return res.status(200).json({ postImage, comments: transformedComments });
        });
    });
});

app.post('/addComment', (req, res) => {
  const userId = req.session.onlineuser;
  const { postId, content } = req.body;

  if (!userId) {
    return res.status(401).json({ error: "User not logged in" });
  }

  const sql = "INSERT INTO `comment` (`userId`, `postId`, `content`, `datePosted`) VALUES (?, ?, ?, NOW())";
  const values = [userId, postId, content];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('MySQL Error:', err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    const newCommentId = result.insertId;
    db.query(
      `SELECT comment.commentId,
              comment.userId,
              comment.content,
              userprofile.nickname,
              userprofile.profilePicture
       FROM comment
       JOIN userprofile ON comment.userId = userprofile.userId
       WHERE comment.commentId = ?`,
      [newCommentId],
      (err, commentData) => {
        if (err) {
          console.error('MySQL Error:', err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        if (commentData.length > 0) {
          const newComment = commentData[0];
          if (newComment.profilePicture) {
            newComment.profilePicture = `data:image/png;base64,${Buffer.from(newComment.profilePicture, 'binary').toString('base64')}`;
          }
          return res.status(201).json(newComment);
        } else {
          return res.status(404).json({ error: "Comment not found" });
        }
      }
    );
  });
});



app.get("/Account", (req, res) => {
    const userId = req.session.onlineuser;
    console.log(`Fetching account details for user: ${userId}`);

    // First query to fetch user details and post count
    db.query(
        `SELECT 
            up.prenom, 
            up.nom, 
            up.bio,
            up.profilePicture,
            COUNT(DISTINCT p.postId) AS postCount,
            COUNT(DISTINCT f1.follower_id) AS followerCount,
            COUNT(DISTINCT f2.followed_id) AS followingCount
        FROM 
            userprofile up
            LEFT JOIN post p ON up.userId = p.userId
            LEFT JOIN followers f1 ON up.userId = f1.followed_id
            LEFT JOIN followers f2 ON up.userId = f2.follower_id
        WHERE 
            up.userId = ?`,
        [userId],
        (err, userResults) => {
            if (err) {
                console.error("Error fetching user details:", err);
                return res.status(500).json({ error: 'Erreur lors de la récupération des informations de l\'utilisateur' });
            }

            if (userResults.length > 0) {
                const user = userResults[0];
                if (user.profilePicture) {
                    user.profilePicture = `data:image/png;base64,${Buffer.from(user.profilePicture, 'binary').toString('base64')}`;
                }


                db.query(
                    `SELECT p.contentimg 
                     FROM post p
                     WHERE p.userId = ?`,
                    [userId],
                    (err, postResults) => {
                        if (err) {
                            console.error("Error fetching post images:", err);
                            return res.status(500).json({ error: 'Erreur lors de la récupération des images de l\'utilisateur' });
                        }

                        user.postImages = postResults.map(post => 
                            post.contentimg 
                            ? `data:image/jpeg;base64,${Buffer.from(post.contentimg, 'binary').toString('base64')}`
                            : null
                        ).filter(img => img !== null);

                        res.json({ user });
                    }
                );
            } else {
                res.status(404).json({ error: 'L\'utilisateur avec l\'ID spécifié n\'existe pas' });
            }
        }
    );
});

 app.post('/updateUser', upload.single('profilePicture'), (req, res) => {
    const userId = req.session.onlineuser; 
    const { first_name, last_name, nickname, email, password } = req.body;

    if (!userId) {
        return res.status(401).json({ error: "User not logged in" });
    }

    let sql = `
        UPDATE userprofile 
        SET 
            prenom = ?, 
            nom = ?, 
            nickname = ?, 
            email = ?, 
            password = ? 
    `;
    let values = [first_name, last_name, nickname, email, password, userId];

    if (req.file) {
        sql += `, profilePicture = ? `;
        values.splice(values.length - 1, 0, req.file.buffer); // Insert profilePicture buffer before userId
    }

    sql += `WHERE userId = ?`;

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error updating user data:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        res.status(200).json({ message: "User data updated successfully" });
    });
});
app.get('/getUserData', (req, res) => {
    const userId = req.session.onlineuser;

    if (!userId) {
        return res.status(401).json({ error: "User not logged in" });
    }

    const sql = `
        SELECT prenom, nom, nickname, email, bio, profilePicture,password
        FROM userprofile
        WHERE userId = ?
    `;

    db.query(sql, [userId], (err, data) => {
        if (err) {
            console.error("Error fetching user data:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        if (data.length > 0) {
            const user = data[0];
            if (user.profilePicture) {
                user.profilePicture = `data:image/png;base64,${Buffer.from(user.profilePicture, 'binary').toString('base64')}`;
            }
            return res.status(200).json(user);
        } else {
            return res.status(404).json({ error: "User not found" });
        }
    });
});



app.post('/togglelike', (req, res) => {
  const { postId } = req.body;
  const userId = req.session.onlineuser;

  db.query("SELECT * FROM `likes` WHERE `postId` = ? AND `userId` = ?", [postId, userId], (err, data) => {
    if (err) {
      console.error('MySQL Error:', err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (data.length > 0) {
      // User has liked the post, so remove the like
      db.query("DELETE FROM `likes` WHERE `postId` = ? AND `userId` = ?", [postId, userId], (err, result) => {
        if (err) {
          console.error('MySQL Error:', err);
          return res.status(500).json({ error: "Internal Server Error" });
        }
          console.log("ana hna",data)
        // Delete corresponding notification
        const content=`${data[0].userId} liked your post ${postId}`
        db.query("DELETE FROM `notification` WHERE `content`=?", [content], (err, result) => {
          if (err) {
            console.error('MySQL Error:', err);
            return res.status(500).json({ error: "Internal Server Error" });
          }
          return res.status(200).json({ message: "Like removed successfully" });
        });
      });
    } else {
      db.query("INSERT INTO `likes` (`userId`, `postId`, `dateLiked`) VALUES (?, ?, NOW())", [userId, postId], (err, result) => {
        if (err) {
          console.error('MySQL Error:', err);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        return res.status(201).json({ message: "Like added successfully" });
      });
    }
  });
});


app.get('/unreadCounts', (req, res) => {
  const userId = req.query.userId;

  try {
    const result = db.query(
      'SELECT COUNT(*) as unreadCount FROM message WHERE receiverId =? AND isSeen = 0',
      [userId]
    );

    if (result.length > 0) {
      res.status(200).json({ unreadCount: result[0].unreadCount });
    } else {
      res.status(200).json({ unreadCount: 0 });
    }
  } catch (error) {
    console.error('Error fetching unread counts:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/markAsSeen', (req, res) => {
    const { userId } = req.body;
  
    const sql = "UPDATE message SET isseen = 1 WHERE receiverId = ? AND isseen = 0";
    db.query(sql, [userId], (err, result) => {
      if (err) {
        console.error('MySQL Error:', err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      return res.status(200).json({ message: "Messages marked as seen successfully" });
    });
});

app.get('/friends', (req, res) => {
    const userId = req.session.onlineuser; 
    console.log("friends:", req.session.onlineuser);
    const sql = `
        SELECT 
            userprofile.userId, 
            userprofile.nickname, 
            userprofile.profilePicture,
            m.content AS lastMessage,
            m.dateSent AS lastMessageDate,
            m.isseen AS lastMessageStatus
        FROM followers
        JOIN userprofile ON followers.followed_id = userprofile.userId
        LEFT JOIN message m ON 
            (userprofile.userId = m.senderId OR userprofile.userId = m.receiverId)
            AND m.dateSent = (
                SELECT MAX(dateSent) 
                FROM message 
                WHERE (senderId = userprofile.userId OR receiverId = userprofile.userId)
            )
        WHERE followers.follower_id = ?`;

    db.query(sql, [userId], (err, data) => {
        if (err) {
            console.error('MySQL Error:', err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        const friendsWithBase64 = data.map(friend => {
            if (friend.profilePicture) {
                friend.profilePicture = `data:image/png;base64,${Buffer.from(friend.profilePicture, 'binary').toString('base64')}`;
            }
            return friend;
        });
        return res.status(200).json(friendsWithBase64);
    });
});
app.get('/getChats', (req, res) => {
    const { userId, friendId } = req.query; 

    const sql = `
        SELECT 
            *,
            CASE WHEN senderId = ? THEN 1 ELSE 0 END AS isSentByUser,
            CASE WHEN receiverId = ? THEN 1 ELSE 0 END AS isReceivedByUser
        FROM message
        WHERE (senderId = ? AND receiverId = ?)
        OR (senderId = ? AND receiverId = ?)
        ORDER BY dateSent ASC`;

    db.query(sql, [userId, userId, userId, friendId, friendId, userId], (err, data) => {
        if (err) {
            console.error('MySQL Error:', err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        
        const updateSql = `UPDATE message SET isseen = 1 WHERE receiverId = ? AND senderId = ? AND isseen = 0`;
        db.query(updateSql, [userId, friendId], (err, result) => {
            if (err) {
                console.error('MySQL Error:', err);
            }
        });
        
        return res.status(200).json(data);
    });
});

app.post('/sendChat', (req, res) => {
    const { senderId, receiverId, content } = req.body; 
    const dateSent = new Date(); 

    const sql = "INSERT INTO message (senderId, receiverId, content, dateSent, isseen) VALUES (?,?,?,?,0)";
    const values = [senderId, receiverId, content, dateSent];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('MySQL Error:', err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        return res.status(201).json({ message: "Message sent successfully", dateSent });
    });
});
 app.put("/update", (req, res) => {
    const { first_name, last_name, nickname, email, password } = req.body;
    const userId = req.session.userId; 

    db.query(
        "UPDATE userprofile SET first_name = ?, last_name = ?, nickname = ?, email = ?, password = ? WHERE userId = ?",
        [first_name, last_name, nickname, email, password, userId],
        (err, result) => {
            if (err) {
                console.error("Error updating user data:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }


            res.status(200).json({ message: "User data updated successfully" });
        }
    );
 });




// Route to fetch user profile details
// app.get('/profile/:userId', (req, res) => {
//   const loggedInUserId = req.session.onlineuser; // Assuming you have the logged-in user's ID in the session
//   const userId = req.params.userId;

//   const profileQuery = `
//     SELECT
//       up.userId,
//       up.prenom,
//       up.nom,
//       up.bio,
//       up.profilePicture,
//       COUNT(DISTINCT p.postId) AS postCount,
//       COUNT(DISTINCT f1.followed_id) AS followerCount,
//       COUNT(DISTINCT f2.follower_id) AS followingCount
//     FROM
//       userprofile up
//       LEFT JOIN post p ON up.userId = p.userId
//       LEFT JOIN followers f1 ON up.userId = f1.followed_id
//       LEFT JOIN followers f2 ON up.userId = f2.follower_id
//     WHERE
//       up.userId = ?
//     GROUP BY
//       up.userId;
//   `;

//   db.query(profileQuery, [userId], (err, profileData) => {
//     if (err) {
//       console.error("Error fetching user profile:", err);
//       return res.status(500).json({ error: "Internal Server Error" });
//     }

//     if (profileData.length > 0) {
//       const userProfile = profileData[0];
//       // Convert profilePicture to base64 if it exists
//       if (userProfile.profilePicture) {
//         userProfile.profilePicture = `data:image/png;base64,${Buffer.from(userProfile.profilePicture, 'binary').toString('base64')}`;
//       }

//       const followStatusQuery = `
//         SELECT
//           (SELECT COUNT(*) FROM followers WHERE follower_id = ? AND followed_id = ?) AS isFollowing,
//           (SELECT COUNT(*) FROM followers WHERE follower_id = ? AND followed_id = ?) AS isFollowed
//       `;

//       db.query(followStatusQuery, [loggedInUserId, userId, userId, loggedInUserId], (err, followStatusData) => {
//         if (err) {
//           console.error("Error fetching follow status:", err);
//           return res.status(500).json({ error: "Internal Server Error" });
//         }
      
      
        
//         const isFollowing = followStatusData[0].isFollowing;
//         const isFollowed = followStatusData[0].isFollowed;

//         if (isFollowing && isFollowed) {
//           userProfile.followStatus = "Followed";
          
//         } else if (isFollowed) {
//           userProfile.followStatus = "Follow Back";
          
//         } else {
//           userProfile.followStatus = "Follow";
          
//         }

//         const getPostImagesQuery = `
//           SELECT contentimg
//           FROM post
//           WHERE userId = ?
//         `;

//         db.query(getPostImagesQuery, [userId], (err, postResults) => {
//           if (err) {
//             console.error("Error fetching post images:", err);
//             return res.status(500).json({ error: "Internal Server Error" });
//           }

//           userProfile.postImages = postResults.map(post =>
//             post.contentimg
//             ? `data:image/jpeg;base64,${Buffer.from(post.contentimg, 'binary').toString('base64')}`
//             : null
//           ).filter(img => img !== null);
 
//           res.json(userProfile);
//         });
//       });
//     } else {
//       return res.status(404).json({ error: "User profile not found" });
//     }
//   });
// });

// // Route to handle follow/unfollow actions
// app.post('/follow/:userId', (req, res) => {
//   const followerId = req.session.onlineuser; // Assuming you have the online user's ID in session
//   const followedId = req.params.userId;

//   if (!followerId) {
//     return res.status(401).json({ error: "User not logged in" });
//   }

//   const followQuery = `
//     INSERT INTO followers (follower_id, followed_id) VALUES (?, ?)
//   `;

//   db.query(followQuery, [followerId, followedId], (err, result) => {
//     if (err) {
//       console.error('Error following user:', err);
//       return res.status(500).json({ error: "Internal Server Error" });
//     }
//     return res.status(201).json({ message: "User followed successfully" });
//   });
// });
// app.post('/unfollow/:userId', (req, res) => {
//   const followerId = req.session.onlineuser; // Assuming you have the online user's ID in session
//   const followedId = req.params.userId;

//   if (!followerId) {
//     return res.status(401).json({ error: "User not logged in" });
//   }

//   const unfollowQuery = `
//     DELETE FROM followers WHERE follower_id = ? AND followed_id = ?
//   `;

//   db.query(unfollowQuery, [followerId, followedId], (err, result) => {
//     if (err) {
//       console.error('Error unfollowing user:', err);
//       return res.status(500).json({ error: "Internal Server Error" });
//     }
//     return res.status(200).json({ message: "User unfollowed successfully" });
//   });
// });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Route to handle follow/unfollow actions
app.get('/profile/:userId', (req, res) => {
  const loggedInUserId = req.session.onlineuser; // Assuming you have the logged-in user's ID in the session
  const userId = req.params.userId;

  const profileQuery = `
    SELECT 
      up.userId, 
      up.prenom, 
      up.nom, 
      up.bio, 
      up.profilePicture, 
      COUNT(DISTINCT p.postId) AS postCount,
      COUNT(DISTINCT f1.followed_id) AS followerCount,
      COUNT(DISTINCT f2.follower_id) AS followingCount
    FROM 
      userprofile up
      LEFT JOIN post p ON up.userId = p.userId
      LEFT JOIN followers f1 ON up.userId = f1.followed_id
      LEFT JOIN followers f2 ON up.userId = f2.follower_id
    WHERE 
      up.userId = ?
    GROUP BY
      up.userId;
  `;

  db.query(profileQuery, [userId], (err, profileData) => {
    if (err) {
      console.error("Error fetching user profile:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (profileData.length > 0) {
      const userProfile = profileData[0];
      // Convert profilePicture to base64 if it exists
      if (userProfile.profilePicture) {
        userProfile.profilePicture = `data:image/png;base64,${Buffer.from(userProfile.profilePicture, 'binary').toString('base64')}`;
      }

      const followStatusQuery = `
        SELECT 
          (SELECT COUNT(*) FROM followers WHERE follower_id = ? AND followed_id = ?) AS isFollowing,
          (SELECT COUNT(*) FROM followers WHERE follower_id = ? AND followed_id = ?) AS isFollowed
      `;

      db.query(followStatusQuery, [loggedInUserId, userId, userId, loggedInUserId], (err, followStatusData) => {
        if (err) {
          console.error("Error fetching follow status:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        const isFollowing = followStatusData[0].isFollowing;
        const isFollowed = followStatusData[0].isFollowed;

        if (isFollowing && isFollowed) {
          userProfile.followStatus = "Followed";
        } else if (isFollowed) {
          userProfile.followStatus = "Follow Back";
        } else {
          userProfile.followStatus = "Follow";
        }

        const getPostImagesQuery = `
          SELECT contentimg 
          FROM post 
          WHERE userId = ?
        `;

        db.query(getPostImagesQuery, [userId], (err, postResults) => {
          if (err) {
            console.error("Error fetching post images:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }

          userProfile.postImages = postResults.map(post => 
            post.contentimg 
            ? `data:image/jpeg;base64,${Buffer.from(post.contentimg, 'binary').toString('base64')}`
            : null
          ).filter(img => img !== null);

          res.json(userProfile);
        });
      });
    } else {
      return res.status(404).json({ error: "User profile not found" });
    }
  });
});
app.post('/follow/:userId', (req, res) => {
  const followerId = req.session.onlineuser; // Assuming you have the online user's ID in session
  const followedId = req.params.userId;

  if (!followerId) {
    return res.status(401).json({ error: "User not logged in" });
  }

  const checkFollowQuery = `
    SELECT * FROM followers WHERE follower_id = ? AND followed_id = ?
  `;

  db.query(checkFollowQuery, [followerId, followedId], (err, results) => {
    if (err) {
      console.error('Error checking follow status:', err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.length > 0) {
      // Already following, so unfollow
      const unfollowQuery = `
        DELETE FROM followers WHERE follower_id = ? AND followed_id = ?
      `;

      db.query(unfollowQuery, [followerId, followedId], (err) => {
        if (err) {
          console.error('Error unfollowing user:', err);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        return res.status(200).json({ followStatus: "Follow", message: "User unfollowed successfully" });
      });
    } else {
      // Not following, so follow
      const followQuery = `
        INSERT INTO followers (follower_id, followed_id) VALUES (?, ?)
      `;

      db.query(followQuery, [followerId, followedId], (err) => {
        if (err) {
          console.error('Error following user:', err);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        return res.status(201).json({ followStatus: "Followed", message: "User followed successfully" });
      });
    }
  });
});


// Assuming you have already set up your Express server and connected to your database

// Endpoint to count notifications for a user
app.get('/notifications/count', (req, res) => {
  const userId = req.session.onlineuser; // Assuming you store user ID in the session

  // Query to count notifications for the user
  const sql = `
    SELECT COUNT(*) AS notificationCount
    FROM notification
    WHERE userId = ?
      AND vuenotification = 0
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error('Error counting notifications:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const notificationCount = result[0].notificationCount;
    console.log('Notification count:', notificationCount)
    res.json({ notificationCount });
  });
});
app.get('/messages/count', (req, res) => {
  const userId = req.session.onlineuser; // Assuming you store user ID in the session

  const messageSql = `
    SELECT COUNT(*) AS messageCount
    FROM message
    WHERE receiverId = ?
      AND isseen = 0
  `;

  db.query(messageSql, [userId], (err, messageResult) => {
    if (err) {
      console.error('Error counting messages:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const messageCount = messageResult[0].messageCount;
    res.json({ messageCount });
  });
});




app.post('/sendNotification', (req, res) => {
  const senderId = req.session.onlineuser;
  db.query("SELECT nickname FROM `userprofile` WHERE userId=?", senderId, (err, result) => {
    if (err) {
        console.error('Error sending notification:', err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
    const { post_userid, postId } = req.body;
    const content=`${senderId} liked your post ${postId}`
    console.log("ossama",post_userid)
    db.query(
      `INSERT INTO notification(userId, content,senderId,dateSent) VALUES (?,?,?,now())`,
      [post_userid, content,senderId],
      (err, result) => {
        if (err) {
          console.error('Error sending notification:', err);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        return res.status(200).json({ message: "Notification sent successfully" });
      }
    );
  })
});
app.post('/sendnotificationcomment', (req, res) => {
  const senderId = req.session.onlineuser;
  db.query("SELECT nickname FROM `userprofile` WHERE userId=?", senderId, (err, result) => {
    if (err) {
        console.error('Error sending notification:', err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
    const { post_userid, postId } = req.body;
    const content=` ${senderId} add comment on your post ${postId} `
    console.log("ossama",post_userid)
    db.query(
      `INSERT INTO notification(userId, content,senderId,dateSent) VALUES (?,?,?,now())`,
      [post_userid, content,senderId],
      (err, result) => {
        if (err) {
          console.error('Error sending notification:', err);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        return res.status(200).json({ message: "Notification sent successfully" });
      }
    );
  })
});


app.get('/search/users', (req, res) => {
  const searchTerm = req.query.q;

  const searchQuery = `
    SELECT userId, nickname, email, nom, prenom, profilePicture 
    FROM userprofile 
    WHERE 
      nickname LIKE ? OR 
      email LIKE ? OR 
      nom LIKE ? OR 
      prenom LIKE ?
  `;

  const searchValue = `%${searchTerm}%`;

  db.query(searchQuery, [searchValue, searchValue, searchValue, searchValue], (err, results) => {
    if (err) {
      console.error('Error searching users:', err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Convert profilePicture to base64 if it exists
    const users = results.map(user => {
      if (user.profilePicture) {
        user.profilePicture = `data:image/png;base64,${Buffer.from(user.profilePicture, 'binary').toString('base64')}`;
      }
      return user;
    });

    res.json(users);
  });
});


app.get('/notifications', (req, res) => {
  const loggedInUserId = req.session.onlineuser;

  if (!loggedInUserId) {
    return res.status(401).json({ error: "User not logged in" });
  }

  const notificationsQuery = `
    SELECT n.notificationId, n.content, n.dateSent,n.vuenotification, u.nickname, u.profilePicture, p.contentimg AS postImage
    FROM notification n
    JOIN userprofile u ON n.senderId = u.userId
    LEFT JOIN post p ON n.content LIKE CONCAT('% post ', p.postId, '%')
    WHERE n.userId = ?
    ORDER BY n.dateSent DESC
  `;

  db.query(notificationsQuery, [loggedInUserId], (err, results) => {
    if (err) {
      console.error('Error fetching notifications:', err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Convert profilePicture and postImage to base64 if they exist
    const notifications = results.map(notification => {
      if (notification.profilePicture) {
        notification.profilePicture = `data:image/png;base64,${Buffer.from(notification.profilePicture, 'binary').toString('base64')}`;
      }
      if (notification.postImage) {
        notification.postImage = `data:image/png;base64,${Buffer.from(notification.postImage, 'binary').toString('base64')}`;
      }
      return notification;
    });

    res.json(notifications);
  });
});



app.post('/notifications/markAllAsViewed', (req, res) => {
  const userId = req.body.userId;

  const query = 'UPDATE notification SET vuenotification = 1 WHERE userId = ?';
  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error marking notifications as viewed');
    } else {
      res.status(200).send('All notifications marked as viewed');
    }
  });
});

// Delete selected notifications
app.post('/notifications/deleteSelected', (req, res) => {
  const notificationIds = req.body.notificationIds;

  const query = 'DELETE FROM notification WHERE notificationId IN (?)';
  db.query(query, [notificationIds], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error deleting notifications');
    } else {
      res.status(200).send('Selected notifications deleted');
    }
  });
});

app.post('/addposts', upload.single('image'), (req, res) => {
  const { content } = req.body;
  const userId = req.session.onlineuser;
  console.log('ana hna',req.session);
  const image = req.file ? req.file.buffer : null; 

  const query = 'INSERT INTO post (userId, content, contentimg, datePosted) VALUES (?, ?, ?, NOW())';
  db.query(query, [userId, content, image], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error adding post');
    } else {
      res.status(200).send('Post added successfully');
    }
  });
});
app.listen(3005, () => {
    console.log('listening on')
})