import { useState, useEffect } from 'react';
import { useQuill } from 'react-quilljs';
import { WriteReviewSectionStyles } from './WriteReviewSectionStyles';
import '../../../../../node_modules/quill/dist/quill.snow.css';
import 'quill/dist/quill.snow.css';

function WriteReviewSection({ onReviewChange }: any) {
  const { quill, quillRef } = useQuill();
  const [content, setContent] = useState('');

  useEffect(() => {
    const handleReviewChange = () => {
      // Get review content from quill editor
      const reviewContent = quill?.getText() || ''; // Use getText to get plain text content
      setContent(reviewContent);
    };

    quill?.on('text-change', handleReviewChange);

    return () => {
      quill?.off('text-change', handleReviewChange);
    };
  }, [quill]);

  useEffect(() => {
    onReviewChange(content);
  }, [content, onReviewChange]);

  return (
    <WriteReviewSectionStyles>
      <div >
        <div style={{ height: '150px' }} ref={quillRef}></div>
      </div>
    </WriteReviewSectionStyles>
  );
}

export default WriteReviewSection;
