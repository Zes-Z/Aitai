'use client';

import { useEffect, useState } from 'react';
import Folder from './Folder';

type FolderItemData = { id: string; title: string; image: string; ratio?: number };
type FolderGroup = { label: string; kind: 'post' | 'project' | 'media'; items: FolderItemData[] };

interface Props { groups: FolderGroup[] }

function openItem(group: FolderGroup, item: FolderItemData) {
  if (group.kind === 'post' || group.kind === 'project') {
    const trigger = [...document.querySelectorAll<HTMLElement>('[data-content-sheet-trigger]')]
      .find((el) => el.dataset.contentSheetTrigger === group.kind + ':' + item.id);
    if (trigger) {
      trigger.click();
      return;
    }
  }
  // Media items are also used as extra folder documents when a project/post
  // collection has fewer than three entries.
  const tile = [...document.querySelectorAll<HTMLButtonElement>('[data-media-tile]')]
    .find((el) => el.dataset.mediaId === item.id);
  tile?.click();
}

const folderSizeFor = (width: number) => {
  if (width >= 1200) return 1.2;
  if (width >= 960) return 1.02;
  if (width >= 760) return 0.88;
  if (width >= 560) return 0.76;
  return 0.64;
};

export default function FolderGateway({ groups }: Props) {
  const [theme, setTheme] = useState<'dawn' | 'sea' | 'star'>('dawn');
  const [active, setActive] = useState<string | null>(null);
  const [folderSize, setFolderSize] = useState(1.2);

  useEffect(() => {
    const update = () => setFolderSize(folderSizeFor(window.innerWidth));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

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
          <div className={'folder-gateway__item' + (active === group.label ? ' is-active' : '')} key={group.label}>
          <Folder
            label={group.label}
            items={group.items.map((item) => ({ title: item.title, image: item.image, alt: item.title, ratio: item.ratio }))}
            variant="glass"
            color="#e3ff7a"
            openOn="hover"
            closeOnPointerLeave={false}
            tilt={0.3}
            frost={0.3}
            tabPosition="left"
            size={folderSize}
            docRatios={[3 / 2, 1, 2 / 3]}
            theme={theme === 'dawn' ? 'light' : 'dark'}
            onOpenChange={(open) => setActive(open ? group.label : null)}
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