'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { UserType } from '@/types/api';
import { baseInputStyles, normalInputStyles } from '@/components/ui/Textarea';
import { parseMentions } from '@/utils/mentions';

type Props = {
  /** Tokenized string: supports {{mention:<uuid>|name:<Display Name>}} */
  value: string;
  /** Called with tokenized string extracted from the editor DOM */
  onChange: (nextValue: string) => void;
  /** People eligible for mentions (ideally accepted connections only) */
  acceptedShares: UserType[];
  /** Change this when switching to a different event to re-hydrate the DOM */
  hydrateKey?: string | number;
  maxHeight?: number;
};

function makeChipEl(userId: string, displayName: string) {
  const chip = document.createElement('span');
  chip.contentEditable = 'false';
  chip.className =
    'inline-flex items-center gap-1 px-2 py-0.5 mx-0.5 bg-primary-100 text-primary-700 rounded-md text-sm font-medium';
  chip.setAttribute('data-user-id', userId);
  chip.setAttribute('data-display-name', displayName);
  chip.textContent = `@${displayName}`;
  return chip;
}

function extractTokenizedValue(root: HTMLElement) {
  let out = '';
  root.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      out += node.textContent ?? '';
      return;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const userId = el.getAttribute('data-user-id');
      const displayName = el.getAttribute('data-display-name');
      if (userId && displayName) {
        out += `{{mention:${userId}|name:${displayName}}}`;
      } else {
        out += el.textContent ?? '';
      }
    }
  });
  return out;
}

function hydrateFromTokenizedValue(root: HTMLElement, value: string) {
  root.innerHTML = '';
  const parts = parseMentions(value);

  parts.forEach((part) => {
    if (part.type === 'text') {
      root.appendChild(document.createTextNode(part.content));
    } else if (part.type === 'mention') {
      root.appendChild(makeChipEl(part.userId, part.displayName));
    }
  });

  // Ensure there's always a trailing text node so caret placement is easy
  if (!root.lastChild || root.lastChild.nodeType !== Node.TEXT_NODE) {
    root.appendChild(document.createTextNode(''));
  }
}

/**
 * Uncontrolled contentEditable mention input with chips.
 */
export function DescriptionInput({
  value,
  onChange,
  acceptedShares,
  hydrateKey,
  maxHeight = 120,
}: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mention state
  const mentionRangeRef = useRef<Range | null>(null);
  const mentionActiveRef = useRef(false);

  const [showDropdown, setShowDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Hydrate editor DOM when switching events (IMPORTANT: not on every keystroke)
  useEffect(() => {
    if (!editorRef.current) return;
    hydrateFromTokenizedValue(editorRef.current, value);
    setShowDropdown(false);
    setMentionQuery('');
    setSelectedIndex(0);
    mentionRangeRef.current = null;
    mentionActiveRef.current = false;
  }, [hydrateKey]);

  const filteredUsers = useMemo(() => {
    const q = mentionQuery.trim().toLowerCase();
    const list = acceptedShares.filter((u) => {
      if (!q) return true;
      const full = `${u.first_name} ${u.last_name}`.toLowerCase();
      const handle = (u.handle || '').toLowerCase();
      return full.includes(q) || handle.includes(q);
    });
    return list.slice(0, 8);
  }, [acceptedShares, mentionQuery]);

  const commitChange = () => {
    if (!editorRef.current) return;
    const next = extractTokenizedValue(editorRef.current);
    onChange(next);
  };

  const updateMentionQueryFromSelection = () => {
    const r = mentionRangeRef.current;
    const sel = window.getSelection();
    if (!r || !sel || sel.rangeCount === 0) return;

    const caret = sel.getRangeAt(0);

    try {
      // keep mention start; extend end to caret
      r.setEnd(caret.endContainer, caret.endOffset);
    } catch {
      // selection got weird (chip boundaries, etc.)
      mentionRangeRef.current = null;
      mentionActiveRef.current = false;
      setShowDropdown(false);
      setMentionQuery('');
      return;
    }

    const text = r.toString(); // like "@sar"
    if (!text.startsWith('@')) {
      mentionRangeRef.current = null;
      mentionActiveRef.current = false;
      setShowDropdown(false);
      setMentionQuery('');
      return;
    }

    const q = text.slice(1);

    // Cancel mention if whitespace/newline entered
    if (q.includes(' ') || q.includes('\n')) {
      mentionRangeRef.current = null;
      mentionActiveRef.current = false;
      setShowDropdown(false);
      setMentionQuery('');
      return;
    }

    setMentionQuery(q);
    setShowDropdown(true);
    setSelectedIndex(0);
  };

  const startMentionAtCaret = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const caret = sel.getRangeAt(0).cloneRange();

    // We want the mention range to include the "@" that the browser will insert.
    // The simplest approach: after '@' is typed, onInput will call updateMentionQueryFromSelection()
    // and we will expand from a start position that is one char behind caret (where '@' begins).
    // But at keydown time, '@' isn't inserted yet. So we mark active and let onInput set the range.
    mentionActiveRef.current = true;

    // Create a start range at caret, we'll adjust in onInput after '@' appears.
    mentionRangeRef.current = caret;
  };

  const finalizeMentionStartIfNeeded = () => {
    if (!mentionActiveRef.current) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const caret = sel.getRangeAt(0);
    const r = mentionRangeRef.current;
    if (!r) return;

    // After '@' is inserted, caret is after '@'. Set range start to include '@'.
    try {
      const startContainer = caret.startContainer;
      const startOffset = caret.startOffset;

      // We only handle the common case: caret in a TEXT_NODE.
      // If it's not a TEXT_NODE, we bail and disable mention.
      if (startContainer.nodeType !== Node.TEXT_NODE) {
        mentionActiveRef.current = false;
        mentionRangeRef.current = null;
        return;
      }

      const textNode = startContainer as Text;
      const newStart = Math.max(0, startOffset - 1);

      // Ensure the char right before caret is actually '@'
      const s = textNode.data;
      if (s[newStart] !== '@') {
        mentionActiveRef.current = false;
        mentionRangeRef.current = null;
        return;
      }

      r.setStart(textNode, newStart);
      r.setEnd(textNode, startOffset);
      mentionActiveRef.current = false; // we've initialized the range
      updateMentionQueryFromSelection();
    } catch {
      mentionActiveRef.current = false;
      mentionRangeRef.current = null;
    }
  };

  const insertMentionChip = (user: UserType) => {
    const root = editorRef.current;
    const sel = window.getSelection();
    const r = mentionRangeRef.current;
    if (!root || !sel || !r) return;

    // Replace "@query" with chip + trailing space
    r.deleteContents();

    const initial = user.last_name ? user.last_name.charAt(0) + '.' : '';
    const displayName = `${user.first_name} ${initial}`.trim();
    const chip = makeChipEl(user.id, displayName);
    const space = document.createTextNode(' ');

    // Insert in correct order: chip then space
    r.insertNode(space);
    r.insertNode(chip);

    // Put caret after the space
    const newRange = document.createRange();
    newRange.setStartAfter(space);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);

    // Reset mention state
    mentionRangeRef.current = null;
    setShowDropdown(false);
    setMentionQuery('');
    setSelectedIndex(0);

    // Ensure trailing text node exists
    if (!root.lastChild || root.lastChild.nodeType !== Node.TEXT_NODE) {
      root.appendChild(document.createTextNode(''));
    }

    commitChange();
    root.focus();
  };

  const handleInput = () => {
    // First, if we just typed '@', initialize mention range start
    finalizeMentionStartIfNeeded();

    // If mention is active, update query from range
    if (showDropdown) {
      updateMentionQueryFromSelection();
    }

    commitChange();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Start mention tracking on '@'
    if (e.key === '@') {
      startMentionAtCaret();
      // allow default insertion of '@'
      return;
    }

    // Dropdown navigation
    if (showDropdown && filteredUsers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredUsers.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        insertMentionChip(filteredUsers[selectedIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowDropdown(false);
        mentionRangeRef.current = null;
        setMentionQuery('');
        return;
      }
    }

    // Backspace: delete previous chip as a unit
    if (e.key === 'Backspace' && editorRef.current) {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;

      const range = sel.getRangeAt(0);
      if (!range.collapsed) return;

      const container = range.startContainer;

      // Determine previous sibling element from caret position
      let prev: Node | null = null;

      if (container.nodeType === Node.TEXT_NODE) {
        // If caret is at the beginning of a text node, check previous sibling
        if (range.startOffset === 0) {
          prev = container.previousSibling;
        }
      } else {
        // If caret is in the editor element, check child before the offset
        const el = container as Element;
        prev = el.childNodes[range.startOffset - 1] ?? null;
      }

      if (prev instanceof HTMLElement && prev.hasAttribute('data-user-id')) {
        e.preventDefault();
        const chip = prev;

        // Place caret right where chip was (before deleting)
        const newRange = document.createRange();
        const parent = chip.parentNode;
        if (!parent) return;

        const index = Array.prototype.indexOf.call(parent.childNodes, chip);
        chip.remove();

        // Ensure there's a text node at that position
        const childAtIndex = parent.childNodes[index];
        if (!childAtIndex || childAtIndex.nodeType !== Node.TEXT_NODE) {
          parent.insertBefore(document.createTextNode(''), childAtIndex ?? null);
        }

        const textNode = parent.childNodes[index] as Text;
        newRange.setStart(textNode, 0);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);

        // Cancel mention if we were mid-mention
        mentionRangeRef.current = null;
        setShowDropdown(false);
        setMentionQuery('');

        commitChange();
      }
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return;

    const onMouseDown = (e: MouseEvent) => {
      const t = e.target as Node;
      const inEditor = editorRef.current?.contains(t);
      const inDropdown = dropdownRef.current?.contains(t);
      if (!inEditor && !inDropdown) {
        setShowDropdown(false);
        mentionRangeRef.current = null;
        setMentionQuery('');
      }
    };

    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [showDropdown]);

  return (
    <div className="relative">
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className={`${baseInputStyles} ${normalInputStyles} overflow-y-auto`}
        style={{ minHeight: '2.5rem', maxHeight }}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
      />

      {showDropdown && filteredUsers.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 bg-white border border-secondary-300 rounded-md shadow-lg max-h-48 overflow-y-auto mt-1"
          style={{ top: '100%', left: 0, minWidth: 220, maxWidth: 320 }}
        >
          {filteredUsers.map((user, idx) => (
            <button
              key={user.id}
              type="button"
              onClick={() => insertMentionChip(user)}
              className={`w-full text-left px-3 py-2 hover:bg-secondary-50 transition-colors ${
                idx === selectedIndex ? 'bg-secondary-100' : ''
              }`}
            >
              <div className="font-medium text-sm text-secondary-900">
                {user.first_name} {user.last_name}
              </div>
              <div className="text-xs text-secondary-500">@{user.handle}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
