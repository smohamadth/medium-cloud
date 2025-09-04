import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import PostCard from "../components/PostCard";
import { TabItem, Tabs } from "flowbite-react";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [postStaffs, setPostStaffs] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch(
        `${import.meta.env.VITE_FEED_SERVICE}/getPostsRecent`
      );
      const data = await res.json();
      //console.log(data.posts);
      setPosts(data.recentPosts);

      const resStaff = await fetch(
        `${import.meta.env.VITE_FEED_SERVICE}/getPostsStaff`
      );
      const dataStaff = await resStaff.json();
      console.log(dataStaff);
      setPostStaffs(dataStaff.postStaffs);
    };
    fetchPosts();
  }, []);

  
 
  const handleTabChange = async (newActiveTabIndex) => {
    if (newActiveTabIndex == 0) {
      
      const res = await fetch(
        `${import.meta.env.VITE_FEED_SERVICE}/getPostsRecent`
      );
      const data = await res.json();
      //console.log(data.posts);
      setPosts(data.recentPosts);
    }
    if (newActiveTabIndex == 1) {
      //fetchByCategory("Marketing");
      const res = await fetch(
        `${import.meta.env.VITE_FEED_SERVICE}/getPostsByCat/Marketing`
      );
      const data = await res.json();
      //console.log(data.posts);
      setPosts(data.postsCat);
    }
    if (newActiveTabIndex == 2) {
      //fetchByCategory("Programming");
      const res = await fetch(
        `${import.meta.env.VITE_FEED_SERVICE}/getPostsByCat/Programming`
      );
      const data = await res.json();
      //console.log(data.posts);
      setPosts(data.postsCat);
    }
    if (newActiveTabIndex == 3) {
      //fetchByCategory("Sports");
      const res = await fetch(
        `${import.meta.env.VITE_FEED_SERVICE}/getPostsByCat/Sports`
      );
      const data = await res.json();
      //console.log(data.posts);
      setPosts(data.postsCat);
    }
  };

  return (
    <div class="flex h-96 max-w-8xl mx-auto p-3 gap-8 py-3">
      <div class="flex-[2] p-4">
        <Tabs
          aria-label="Tabs with underline"
          variant="fullwidth"
          onActiveTabChange={handleTabChange}
        >
          <TabItem active title="Recents">
            {posts && posts.length > 0 && (
              <div className="flex flex-col gap-6">
                <h2 className="text-2xl font-semibold text-center">
                  Fors you
                </h2>
                <div className="flex flex-wrap gap-3">
                  {posts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>
              </div>
            )}
          </TabItem>
          <TabItem title="Marketing">
            {posts && posts.length > 0 && (
              <div className="flex flex-col gap-6">
                <h2 className="text-2xl font-semibold text-center">
                  Marketing
                </h2>
                <div className="flex flex-wrap gap-3">
                  {posts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>
              </div>
            )}
          </TabItem>
          <TabItem title="Programming">
            {posts && posts.length > 0 && (
              <div className="flex flex-col gap-6">
                <h2 className="text-2xl font-semibold text-center">
                  Programming
                </h2>
                <div className="flex flex-wrap gap-3">
                  {posts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>
              </div>
            )}
          </TabItem>
          <TabItem title="Sports">
            {posts && posts.length > 0 && (
              <div className="flex flex-col gap-6">
                <h2 className="text-2xl font-semibold text-center">
                  Sports
                </h2>
                <div className="flex flex-wrap gap-3">
                  {posts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>
              </div>
            )}
          </TabItem>
        </Tabs>
      </div>

      <div className="flex-[1] p-4">
        <p className="mb-4 p-4 border-b border-gray-200">Staff picks</p>
        {postStaffs.map((postStaff) => {
          return (
            <div key={postStaff._id} className="mb-6">
              <div className="flex">
                <img className="h-8 w-8 rounded-xl" src={postStaff.image} />
                <span className="ml-2">{postStaff.writer}</span>
              </div>
              <p>
                <Link to={`/post/${postStaff.slug}`}> {postStaff.title} </Link>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
