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

function New_post() {
  const [value, setValue] = React.useState('');

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    fetch('/new/post', {
      method: 'POST',
      body: JSON.stringify({
          content: value,
      })
    })
    .then(response => response.json())
    .then(result => {
      // console.log(result);
    });
    setValue('')
  }

  return (
    <div class="mb-3 card">
      <label for="new_post_text" class="form-label">New Post</label>
      <textarea class="form-control" id="new_post_text" rows="4" value={value} onChange={handleChange}></textarea>
      <button onClick={handleSubmit} type="button" class="btn btn-primary post-btn custom-btm">Post</button>
    </div>
  );
}

function All_posts() {
  // Getting the current user
  var current_user_id = document.getElementById('user_id').value;

  // Declaring state variables
  const [Posts, setPosts] = React.useState([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [editPostId, setEditPostId] = React.useState(null);
  const [newContent, setNewContent] = React.useState('');

  // Number of posts allowed per page
  var postsPerPage = 10;

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      fetch('/post/get/all')
        .then(response => response.json())
        .then(Posts => {
          // console.log(Posts);
          setPosts(Posts);
      });
    }, 2000);

    // Retorna una función de limpieza para detener el intervalo cuando se desmonte el componente.
    return () => clearInterval(intervalId);
  }, [])

  // Handlers
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

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

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
  const currentPosts = Posts.slice(indexOfFirstPost, indexOfLastPost);

  return (
    <div>
      {currentPosts.map(elemento => (
        <div key={elemento.id} class='individual-post card'>
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
              <a href="#" onClick={(event) => handleEditClick(event, elemento.id)}>Edit</a>
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
        totalPosts={Posts.length}
        currentPage={currentPage}
        handlePageChange={handlePageChange}
      />
    </div>
  )
}

ReactDOM.render(
  <div>
    <New_post />
    <All_posts />
  </div>,
  document.getElementById('index')
);
