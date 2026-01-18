'use client';

interface EventTextBlockProps {
  /**
   * Builder.io `richText` value (HTML string).
   */
  content?: string;
}

export function EventTextBlock({
  content = '<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>',
}: EventTextBlockProps) {
  return <div dangerouslySetInnerHTML={{ __html: content }} />;
}

export const eventTextBlockInfo = {
  name: 'EventTextBlock',
  friendlyName: 'Event Text Block',
  inputs: [
    {
      name: 'content',
      type: 'richText',
      defaultValue:
        '<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>',
      helperText: 'Rich text content (supports formatting/links)',
    },
  ],
};

export default EventTextBlock;

