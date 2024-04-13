import { useYooptaEditor } from '@yoopta/editor';

import {
  List,
  ListOrdered,
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  LinkIcon,
  TextQuoteIcon,
  CodeIcon,
  FileCodeIcon,
} from 'lucide-react';
import s from './SlackChat.module.scss';

const SlackTopToolbar = () => {
  const editor = useYooptaEditor();

  console.log('editor children', editor.children);

  return (
    <div className={s.toolbar}>
      <button
        className={s.toolbarItem}
        data-state-active={editor.formats.bold?.isActive()}
        onClick={() => editor.formats.bold.toggle()}
      >
        <BoldIcon size={15} strokeWidth={1.5} />
      </button>
      <button
        className={s.toolbarItem}
        data-state-active={editor.formats.italic?.isActive()}
        onClick={() => editor.formats.italic.toggle()}
      >
        <ItalicIcon size={15} strokeWidth={1.5} />
      </button>
      <button
        className={s.toolbarItem}
        data-state-active={editor.formats.strike?.isActive()}
        onClick={() => editor.formats.strike.toggle()}
      >
        <StrikethroughIcon size={15} strokeWidth={1.5} />
      </button>
      <span className={s.separator} />
      <button className={s.toolbarItem}>
        <LinkIcon size={15} strokeWidth={1.5} />
      </button>
      <span className={s.separator} />
      <button
        className={s.toolbarItem}
        data-state-active={editor.blocks.NumberedList?.isActive()}
        onClick={() =>
          editor.blocks.NumberedList.isActive() ? editor.blocks.Paragraph.create() : editor.blocks.NumberedList.create()
        }
      >
        <ListOrdered size={15} strokeWidth={1.5} />
      </button>
      <button
        className={s.toolbarItem}
        data-state-active={editor.blocks.BulletedList?.isActive()}
        onClick={() =>
          editor.blocks.BulletedList.isActive() ? editor.blocks.Paragraph.create() : editor.blocks.BulletedList.create()
        }
      >
        <List size={15} strokeWidth={1.5} />
      </button>
      <span className={s.separator} />
      <button
        className={s.toolbarItem}
        data-state-active={editor.blocks.Blockquote?.isActive()}
        onClick={() => {
          editor.blocks.Blockquote.isActive() ? editor.blocks.Paragraph.create() : editor.blocks.Blockquote.create();
        }}
      >
        <TextQuoteIcon size={15} strokeWidth={1.5} />
      </button>
      <span className={s.separator} />
      <button className={s.toolbarItem} onClick={() => editor.formats.code.toggle()}>
        <CodeIcon size={15} strokeWidth={1.5} />
      </button>
      <button
        className={s.toolbarItem}
        onClick={() => {
          editor.blocks.Code.isActive() ? editor.blocks.Paragraph.create() : editor.blocks.Code.create();
        }}
      >
        <FileCodeIcon size={15} strokeWidth={1.5} />
      </button>
    </div>
  );
};

export { SlackTopToolbar };