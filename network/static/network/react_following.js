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

function Posts() {
  // Getting the current user
  var current_user_id = document.getElementById('user_id').value;

  // Declaring state variables
  const [posts, setPosts] = React.useState([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  var postsPerPage = 10;

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      fetch('/following', {
        method: 'POST',
        body: JSON.stringify({
            content: 'Following',
        })
      })
      .then(response => response.json())
      .then(result => {
        // console.log(result);
        setPosts(result);
      });
    }, 2000);

    // Retorna una función de limpieza para detener el intervalo cuando se desmonte el componente.
    return () => clearInterval(intervalId);
  }, [])

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
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  return (
    <div>
      <h2 class="title">Following Posts</h2>

      {currentPosts.map(elemento => (
        <div class='individual-post card'>
          <a class="author-name" href={"/profile/" + elemento.author_id}>{ elemento.author }</a>
          <p>{ elemento.content }</p>
          <p><span>{ elemento.timestamp }</span></p>
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
  <div>
    <Posts />
  </div>,
  document.getElementById('following')
);
