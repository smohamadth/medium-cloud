import { Button, Spinner, Modal } from "flowbite-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import CommentSection from "../components/CommentSection";
import PostCard from "../components/PostCard";
import { FaThumbsUp } from "react-icons/fa";
import { HiOutlineExclamationCircle } from "react-icons/hi";

export default function PostPage() {
  const { postSlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [post, setPost] = useState(null);
  const [recentPosts, setRecentPosts] = useState(null);
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate()

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${import.meta.env.VITE_POST_SERVICE}/getposts?slug=${postSlug}`);
        const data = await res.json();

        const post_data = data.posts[0];

        if (!res.ok) {
          setError(true);
          setLoading(false);
          return;
        }
        if (res.ok) {
          try {
            const res = await fetch(`${import.meta.env.VITE_USER_SERVICE}/${post_data.userId}`);
            const data = await res.json();
            setPost({
              ...post_data,
              writer: data.username,
              numberOfLikes: post_data.likes.length,
              profilePicture: data.profilePicture,
            });
            setError(false);
            setLoading(false);
          } catch (error) {
            setError(true);
            setLoading(false);
          }
        }
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchPost();
  }, [postSlug]);

  useEffect(() => {
    try {
      const fetchRecentPosts = async () => {
        const res = await fetch(`${import.meta.env.VITE_POST_SERVICE}/getposts?limit=3`);
        const data = await res.json();
        if (res.ok) {
          setRecentPosts(data.posts);
        }
      };
      fetchRecentPosts();
    } catch (error) {
      console.log(error.message);
    }
  }, []);

  const handleLike = async (postId) => {
    try {
      if (!currentUser) {
        navigate("/sign-in");
        return;
      }
      const res = await fetch(`${import.meta.env.VITE_POST_SERVICE}/likePost/${postId}`, {
        method: "PUT",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setPost({
          ...post,
          likes: data.likes,
          numberOfLikes: data.likes.length,
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleDeletePost = async () => {
    setShowModal(false);
    try {
      const res = await fetch(
        `/api/post/deletepost/${post._id}/${currentUser._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        navigate("/")
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  return (
    <main className="p-3 flex flex-col max-w-4xl mx-auto min-h-screen">
      <h1 className="text-3xl mt-10 p-3 text-center font-serif max-w-4xl mx-auto lg:text-4xl">
        {post && post.title}
      </h1>
      {currentUser && post.writer == currentUser.username && (
        <div className="flex flex-row mt-2">
          <button className="w-full text-white bg-gray-700 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-md text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">
            <Link to={`/update-post/${post._id}`}>Update your post</Link>
          </button>
          <button onClick={() => setShowModal(true)} className="w-full text-white bg-red-700 hover:bg-red-900 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-md text-sm px-5 py-2.5 me-2 mb-2">
            Delete your post
          </button>
        </div>
      )}
      <img
        src={post && post.image}
        alt={post && post.title}
        className="mt-10 p-3 max-h-[600px] w-full object-cover"
      />
      <div className="flex justify-between p-3 border-b border-slate-500 mx-auto w-full max-w-2xl text-xs">
        <div className="flex items-center">
          <img
            className="w-9 h-9 mx-2 rounded-2xl"
            src={post.profilePicture}
          ></img>
          <span className="h-fit">{post.writer}</span>
        </div>
        <span>{post && new Date(post.createdAt).toLocaleDateString()}</span>
        <span className="italic">
          {post && (post.content.length / 1000).toFixed(0)} mins read
        </span>
      </div>
      <div
        className="p-3 w-full mx-auto post-content"
        dangerouslySetInnerHTML={{ __html: post && post.content }}
      ></div>

      <div className="flex mx-auto">
        <span className="mx-2">Did you Like the post?</span>
        <button
          type="button"
          onClick={() => handleLike(post._id)}
          className={`text-gray-400 hover:text-blue-500 ${
            currentUser &&
            post.likes.includes(currentUser._id) &&
            "!text-blue-500"
          }`}
        >
          <FaThumbsUp className="text-sm" />
        </button>
        <p className="text-gray-400 mx-1">
          {post.numberOfLikes > 0 &&
            post.numberOfLikes +
              " " +
              (post.numberOfLikes === 1 ? "like" : "likes")}
        </p>
      </div>
      <CommentSection postId={post._id} />

      <div className="flex flex-col justify-center items-center mb-5">
        <h1 className="text-xl mt-5">Recent articles</h1>
        <div className="flex flex-wrap gap-5 mt-5 justify-center">
          {recentPosts &&
            recentPosts.map((post) => <PostCard key={post._id} post={post} />)}
        </div>
      </div>
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this post?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleDeletePost}>
                Yes, I'm sure
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </main>
  );
}
