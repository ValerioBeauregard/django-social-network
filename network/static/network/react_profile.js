function Profile() {
  // Getting the visited user
  var user_id = document.getElementById('user_id').value;

  // Declaring state variables
  const [values, setValues] = React.useState([]);

  // Handlers
  const handleFollow = () => {
    fetch('/users/follow', {
      method: 'POST',
      body: JSON.stringify({
          user_id: user_id,
      })
    })
    .then(response => response.json())
    .then(result => {
      // console.log(result);
    });
  };

  const handleUnfollow = () => {
    fetch('/users/follow', {
      method: 'PUT',
      body: JSON.stringify({
          user_id: user_id,
      })
    })
    .then(response => response.json())
    .then(result => {
      // console.log(result);
    });
  };

  // Getting main profile data
  React.useEffect(() => {
    const intervalId = setInterval(() => {
      fetch('/profile/get/info', {
        method: 'POST',
        body: JSON.stringify({
            user_id: user_id,
        })
      })
      .then(response => response.json())
        .then(result => {
          setValues(result);
      });
    }, 2000);

    // Retorna una función de limpieza para detener el intervalo cuando se desmonte el componente.
    return () => clearInterval(intervalId);
  }, [])

  return (
    <div class="card profile-user-info">
      <img class="profile-image" src="https://thumbs.dreamstime.com/b/default-avatar-profile-vector-user-profile-default-avatar-profile-vector-user-profile-profile-179376714.jpg"></img>
      <h2>{values.username}</h2>
      { values.follow_button ? values.following_exist ? <a class="btn btn-primary custom-btm" onClick={handleUnfollow}>Unfollow</a> : <a class="btn btn-primary custom-btm" onClick={handleFollow}>Follow</a> : <p></p> }
    </div>
  );
}

function Pagination({ postsPerPage, totalPosts, currentPage, handlePageChange }) {
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(totalPosts / postsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div>

      <ul className='pagination'>
        {pageNumbers.map(number => (
          <li key={number} className={number === currentPage ? 'active' : null}>
            <a href="#" onClick={() => handlePageChange(number)}>
              {number < currentPage-1 ? '' : number > currentPage+1 ? '' : number > currentPage ? 'Next' : number < currentPage ? 'Previous' : ""}

            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Profile_info() {
  // Getting the current user
  var user_id = document.getElementById('user_id').value;
  var current_user_id = document.getElementById('current_user_id').value;

  // Declaring state variables
  const [dash, setDash] = React.useState([]);
  const [posts, setPosts] = React.useState([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [editPostId, setEditPostId] = React.useState(null);
  const [newContent, setNewContent] = React.useState('');

  // Number of posts allowed per page
  var postsPerPage = 10;

  // Getting dashboard data
  React.useEffect(() => {
    const intervalId = setInterval(() => {
      fetch('/profile/get/dashboard', {
        method: 'POST',
        body: JSON.stringify({
            user_id: user_id,
        })
      })
      .then(response => response.json())
        .then(result => {
          setDash(result);
      });
    }, 1500);

    // Retorna una función de limpieza para detener el intervalo cuando se desmonte el componente.
    return () => clearInterval(intervalId);
  }, [])

  // Getting posts data
  React.useEffect(() => {
    const intervalId = setInterval(() => {
      fetch('/post/get/user', {
        method: 'POST',
        body: JSON.stringify({
            user_id: user_id,
        })
      })
      .then(response => response.json())
        .then(result => {
          setPosts(result);
      });
    }, 1500);

    // Retorna una función de limpieza para detener el intervalo cuando se desmonte el componente.
    return () => clearInterval(intervalId);
  }, [])

  // Handlers
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleEditClick = (event, postId) => {
    event.preventDefault();
    setEditPostId(postId);
  }

  const handleCancelEditClick = () => {
    setEditPostId(null);
    setNewContent('');
  }

  const handleSaveClick = (postId) => {

    if (newContent.length > 0) {
      fetch('/post/edit', {
        method: 'POST',
        body: JSON.stringify({
          postId: postId,
          newContent: newContent,
        })
      })
      .then(response => response.json())
      .then(result => {
        // console.log(result);
      });
    }

    setEditPostId(null);
    setNewContent('');
  }

  const handleContentChange = (event) => {
    setNewContent(event.target.value);
  }

  const handleLikeClick = (event, postId) => {
    event.preventDefault();

    fetch('/post/like', {
      method: 'POST',
      body: JSON.stringify({
        postId: postId,
      })
    })
    .then(response => response.json())
    .then(result => {
      // console.log(result);
    });
  }

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  return (
    <div class="card profile-info-dash-contenetor">

      <div class="info-dash">
        <div class="post-number">
          <label>POSTS</label>
          <span>{ dash.posts }</span>
        </div>
        <div class="followers">
          <label>FOLLOWERS</label>
          <span>{ dash.followers }</span>
        </div>
        <div class="following">
          <label>FOLLOWING</label>
          <span>{ dash.following }</span>
        </div>
      </div>

      {currentPosts.map(elemento => (
        <div class='individual-post card'>
          <a class="author-name" href={"/profile/" + elemento.author_id}>{ elemento.author }</a>


          {elemento.author_id == current_user_id ? (
            editPostId == elemento.id ? (
              <div class="edit-contenetor">

                <textarea defaultValue={elemento.content} onChange={handleContentChange} type="text" name="new_content" class="form-control" id="new_post_content" rows="4"></textarea>

                <div>
                  <button class="btn btn-primary post-btn custom-btm post-save-btn" onClick={() => handleSaveClick(elemento.id)}>Save</button>
                  <button class="btn btn-primary post-btn custom-btm" onClick={handleCancelEditClick}>Cancel</button>
                </div>

              </div>
            ) : (
              <a href="#" onClick={() => handleEditClick(event, elemento.id)}>Edit</a>
            )
          ) : (
            ''
          )}
          <p>{editPostId == elemento.id ? '' : elemento.content}</p>

          <p><span>{elemento.timestamp}</span></p>

          <a href="#" onClick={(event) => handleLikeClick(event, elemento.id)}>
            <span class={elemento.likes_ids.includes(parseInt(current_user_id)) ? ( "like" ) : ( "like not-like" )}><i class="fa-solid fa-heart"></i>{ elemento.likes }</span>
          </a>

        </div>
      ))}

      <Pagination
        postsPerPage={postsPerPage}
        totalPosts={posts.length}
        currentPage={currentPage}
        handlePageChange={handlePageChange}
      />

    </div>
  )
}

ReactDOM.render(
  <div class="profile-contenetor">
    <Profile />
    <Profile_info />
  </div>,
  document.getElementById('profile')
);
