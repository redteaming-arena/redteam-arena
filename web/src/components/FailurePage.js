import React, { useEffect, useState } from "react";
import NavButton from "./NavButton";
import { getLeaderboard, postSharedMessages } from "../services/api";
import { UserRankingComponent } from "./EloTable";
import { Button } from "./ui/button";
import Footer from "./Footer";

const FailurePage = ({
  onReset,
  sessionId,
  currentModel,
  currentPhrase,
  onAbout,
  onHomeButton,
  showAbout = false,
}) => {
  const [shared, setShared] = React.useState(false);
  const [leaderboardData, setLeaderboardData] = useState(null);

  useEffect(() => {
    const handleLeaderboard = async () => {
      try {
        const response = await getLeaderboard(true);
        console.log(response);
        setLeaderboardData(response);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      }
    };
    handleLeaderboard();
  }, []);

  const handleShare = async () => {
    try {
      const response = await postSharedMessages(sessionId);

      if (response.path !== undefined) {
        const shareableLink = `${window.location.origin}/share/${response.path}`;

        // Check if the Web Share API is available (common on mobile devices)
        if (navigator.share) {
          try {
            await navigator.share({
              title: "Shared Chat",
              text: "Check out this chat!",
              url: shareableLink,
            });
            setShared(true);
            return;
          } catch (error) {
            console.log("Error sharing via Web Share API:", error);
            // Fall back to clipboard copying if share was cancelled or failed
          }
        }

        // Fall back to clipboard copying
        try {
          await navigator.clipboard.writeText(shareableLink);
          alert("Link copied to clipboard!");
          setShared(true);
        } catch (error) {
          console.error("Failed to copy to clipboard:", error);
          // Provide a manual fallback
          prompt("Copy this link:", shareableLink);
        }

        // Open the link in a new tab/window
        window.open(shareableLink, "_blank");
      } else {
        alert(response.message || "Failed to generate shareable link.");
        setShared(false);
      }
    } catch (error) {
      console.error("Error sharing chat:", error);
      alert("Failed to share chat. Please try again later.");
    }
  };

  
  return (
    <>
      <div className="flex flex-col overflow-y-scroll items-center justify-center min-h-screen bg-black text-red-500 font-mono p-4">
        <div className="absolute top-4 right-4 flex gap-2">
          <NavButton text={"HOME"} onClick={onHomeButton} />
          {showAbout && <NavButton text="ABOUT" onClick={onAbout} />}
        </div>
        <div className="text-center">
          <h1 className=" mt-14 text-4xl sm:text-6xl mb-4">You Failed.</h1>
          <h2 className="text-xl sm:text-2xl mb-8">Get fucked, loser.</h2>
          <h3 className="text-md sm:text-xl mb-8">
            Model: {currentModel}
          </h3>
          <h3 className="text-md sm:text-xl mb-8">
            Target Phrase: {currentPhrase}
          </h3>
        </div>
        <div className="flex gap-4 mb-8">
          <Button variant="destructive" onClick={onReset}>
            PLAY AGAIN
          </Button>

          <Button variant="default" onClick={handleShare}>
            {shared ? "UNSHARE" : "SHARE"}
          </Button>
        </div>
        {leaderboardData ? (
          <UserRankingComponent userData={leaderboardData} />
        ) : (
          <p>Loading leaderboard data...</p>
        )}
      </div>
      <Footer />
    </>
  );
};

export default FailurePage;
