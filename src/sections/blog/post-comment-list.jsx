import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';

import { PostCommentItem } from './post-comment-item';

// ----------------------------------------------------------------------

export function PostCommentList({ comments = [] }) {
  return (
    <>
      {comments.map((comment) => {
        const hasReply = !!comment.replyComment.length;

        return (
          <Box key={comment.id}>
            <PostCommentItem
              name={comment.name}
              message={comment.message}
              postedAt={comment.postedAt}
              avatarUrl={comment.avatarUrl}
            />
            {hasReply &&
              comment.replyComment.map((reply) => {
                const employeeReply = comment.employees.find((employee) => employee.id === reply.employeeId);

                return (
                  <PostCommentItem
                    key={reply.id}
                    name={employeeReply?.name || ''}
                    message={reply.message}
                    postedAt={reply.postedAt}
                    avatarUrl={employeeReply?.avatarUrl || ''}
                    tagEmployee={reply.tagEmployee}
                    hasReply
                  />
                );
              })}
          </Box>
        );
      })}

      <Pagination
        count={8}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          my: { xs: 5, md: 8 },
        }}
      />
    </>
  );
}
