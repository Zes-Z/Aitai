'use client';

import { useEffect, useState } from 'react';
import Folder from './Folder';

type FolderItemData = { id: string; title: string; image: string };
type FolderGroup = { label: string; kind: 'post' | 'media'; items: FolderItemData[] };

interface Props { groups: FolderGroup[] }

function openItem(group: FolderGroup, item: FolderItemData) {
  if (group.kind === 'post') {
    const trigger = [...document.querySelectorAll<HTMLElement>('[data-content-sheet-trigger]')]
      .find((el) => el.dataset.contentSheetTrigger === 'post:' + item.id);
    trigger?.click();
    return;
  }
  const tile = [...document.querySelectorAll<HTMLButtonElement>('[data-media-tile]')]
    .find((el) => el.dataset.mediaId === item.id);
  tile?.click();
}

export default function FolderGateway({ groups }: Props) {
  const [theme, setTheme] = useState<'dawn' | 'sea' | 'star'>('dawn');

  useEffect(() => {
    const sync = () => {
      const value = document.documentElement.dataset.theme;
      if (value === 'dawn' || value === 'sea' || value === 'star') setTheme(value);
    };
    sync();
    window.addEventListener('aitai:theme', sync);
    return () => window.removeEventListener('aitai:theme', sync);
  }, []);

  return (
    <div className="folder-gateway">
      <div className="folder-gateway__row">
        {groups.map((group) => (
          <div className="folder-gateway__item" key={group.label}>
          <Folder
            label={group.label}
            items={group.items.map((item) => ({ title: item.title, image: item.image, alt: item.title }))}
            variant="glass"
            color="#e3ff7a"
            openOn="hover"
            tilt={0.3}
            frost={0.3}
            tabPosition="left"
            size={1.2}
            theme={theme === 'dawn' ? 'light' : 'dark'}
            onItemClick={(_item, index) => {
              const selected = group.items[index];
              if (selected) openItem(group, selected);
            }}
          />
          </div>
        ))}
      </div>
    </div>
  );
}
