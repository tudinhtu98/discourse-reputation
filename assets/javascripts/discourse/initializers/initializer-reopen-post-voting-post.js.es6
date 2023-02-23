import { withPluginApi } from "discourse/lib/plugin-api";
import { includeAttributes } from "discourse/lib/transform-post";
import { castVote, removeVote } from "../lib/post-voting-utilities";
import { popupAjaxError } from "discourse/lib/ajax-error";

export default {
  name: "initializer-reopen-post-voting-post",
  initialize() {
    withPluginApi("0.11.0", api => {
      includeAttributes("user_vote_count");

      api.reopenWidget("post-voting-post", {
        removeVote(direction) {
          const post = this.attrs.post;
          const countChange = direction === "up" ? -5 : 2;

          post.setProperties({
            post_voting_user_voted_direction: null,
            post_voting_vote_count: post.post_voting_vote_count + countChange,
            user_vote_count: post.user_vote_count + countChange,
          });

          const voteCount = post.post_voting_vote_count;
          const user_vote_count = post.user_vote_count;

          this.state.loading = true;

          return removeVote({ post_id: post.id })
            .catch((error) => {
              post.setProperties({
                post_voting_user_voted_direction: direction,
                post_voting_vote_count: voteCount - countChange,
                user_vote_count: user_vote_count - countChange,
              });

              this.scheduleRerender();

              popupAjaxError(error);
            })
            .finally(() => (this.state.loading = false));
        },

        vote(direction) {
          if (!this.currentUser) {
            return this.sendShowLogin();
          }

          const post = this.attrs.post;

          let vote = {
            post_id: post.id,
            direction,
          };

          const isUpVote = direction === "up";
          let countChange;

          if (post.post_voting_user_voted_direction) {
            countChange = isUpVote ? 7 : -7;
          } else {
            countChange = isUpVote ? 5 : -2;
          }

          this.attrs.post.setProperties({
            post_voting_user_voted_direction: direction,
            post_voting_vote_count: post.post_voting_vote_count + countChange,
            user_vote_count: post.user_vote_count + countChange,
          });

          const voteCount = post.post_voting_vote_count;
          const user_vote_count = post.user_vote_count;

          this.state.loading = true;

          return castVote(vote)
            .catch((error) => {
              post.setProperties({
                post_voting_user_voted_direction: null,
                post_voting_vote_count: voteCount - countChange,
                user_vote_count: user_vote_count - countChange,
              });

              this.scheduleRerender();

              popupAjaxError(error);
            })
            .finally(() => (this.state.loading = false));
        },
      });
    });
  }
}
