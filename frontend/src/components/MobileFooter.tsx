'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaSearch, FaHashtag, FaRobot } from 'react-icons/fa';

export default function MobileFooter() {
  let pathname = usePathname() || '/';

  return (
    <div className='block md:hidden'>
      <ul className='fixed table table-fixed w-full bottom-0 left-0 z-99 m-0 bg-white'>
        <li className='table-cell text-center'>
          <Link
            href='/'
            className={`pb-3 flex flex-col pt-3 font-bold overflow-hidden whitespace-nowrap ${
              pathname === '/' ? 'text-blue-400' : 'text-gray-400'
            }`}
          >
            <FaHome size={25} className='inline-block w-auto' />
            <span className='mt-1'>ホーム</span>
          </Link>
        </li>
        <li className='table-cell text-center'>
          <Link
            href='/ai'
            className={`flex flex-col pb-3 pt-3 font-bold overflow-hidden whitespace-nowrap ${
              pathname === '/ai' ? 'text-blue-400' : 'text-gray-400'
            }`}
          >
            <FaRobot size={25} className='inline-block w-auto' />
            <span className='mt-1'>AI</span>
          </Link>
        </li>
        <li className='table-cell text-center'>
          <Link
            href='/topics'
            className={`pb-3 flex flex-col pt-3 font-bold overflow-hidden whitespace-nowrap ${
              pathname === '/topics' ? 'text-blue-400' : 'text-gray-400'
            }`}
          >
            <FaHashtag size={25} className='inline-block w-auto' />
            <span className='mt-1'>トピック</span>
          </Link>
        </li>
        <li className='table-cell text-center'>
          <button
            onClick={() => alert('Coming soon!')}
            className='pb-3 text-gray-400 inline-flex flex-col pt-3 font-bold overflow-hidden whitespace-nowrap'
          >
            <FaSearch size={25} className='inline-block w-auto' />
            <span className='mt-1'>検索</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
