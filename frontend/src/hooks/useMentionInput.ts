import { useState, useEffect, useRef, useMemo } from 'react';
import { UserType } from '@/types/api';
import { MENTION_CHIP_STYLES, createMentionToken, parseMentions } from '@/utils/mentions';

interface UseMentionInputProps {
  value: string;
  onChange: (value: string) => void;
  acceptedShares: UserType[];
  hydrateKey?: string | number;
  mentionedUsers?: string[];
  onMentionedUsersChange?: (userIds: string[]) => void;
}

function makeChipEl(userId: string, displayName: string) {
  const chip = document.createElement('span');
  chip.contentEditable = 'false';
  chip.className = MENTION_CHIP_STYLES;
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
        out += createMentionToken(userId, displayName);
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

export function useMentionInput({ value, onChange, acceptedShares, hydrateKey, onMentionedUsersChange }: UseMentionInputProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mentionRangeRef = useRef<Range | null>(null);
  const mentionActiveRef = useRef(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionedIds, setMentionedIds] = useState<Set<string>>(new Set());

  // Sync mentionedIds with parent's controlled state
  useEffect(() => {
    if (onMentionedUsersChange) {
      onMentionedUsersChange(Array.from(mentionedIds));
    }
  }, [mentionedIds, onMentionedUsersChange]);

  // Hydrate editor DOM when switching events
  useEffect(() => {
    if (!editorRef.current) return;
    hydrateFromTokenizedValue(editorRef.current, value);

    // Update mentioned IDs from initial value
    const parts = parseMentions(value);
    const ids = new Set<string>();
    parts.forEach((p) => {
      if (p.type === 'mention') ids.add(p.userId);
    });
    setMentionedIds(ids);

    setShowDropdown(false);
    setMentionQuery('');
    setSelectedIndex(0);
    mentionRangeRef.current = null;
    mentionActiveRef.current = false;
  }, [hydrateKey]);

  const filteredUsers = useMemo(() => {
    const q = mentionQuery.trim().toLowerCase();
    const list = acceptedShares.filter((u) => {
      // Exclude users who are already mentioned
      if (mentionedIds.has(u.id)) return false;

      if (!q) return true;
      const full = `${u.first_name} ${u.last_name}`.toLowerCase();
      const handle = (u.handle || '').toLowerCase();
      return full.includes(q) || handle.includes(q);
    });
    return list.slice(0, 8);
  }, [acceptedShares, mentionQuery, mentionedIds]);

  const commitChange = () => {
    if (!editorRef.current) return;
    const next = extractTokenizedValue(editorRef.current);

    // Update mentioned IDs
    const parts = parseMentions(next);
    const ids = new Set<string>();
    parts.forEach((p) => {
      if (p.type === 'mention') ids.add(p.userId);
    });
    setMentionedIds(ids);

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
      mentionRangeRef.current = null;
      mentionActiveRef.current = false;
      setShowDropdown(false);
      setMentionQuery('');
      return;
    }

    const text = r.toString();
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
    mentionActiveRef.current = true;
    mentionRangeRef.current = caret;
  };

  const finalizeMentionStartIfNeeded = () => {
    if (!mentionActiveRef.current) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const caret = sel.getRangeAt(0);
    const r = mentionRangeRef.current;
    if (!r) return;

    try {
      const startContainer = caret.startContainer;
      const startOffset = caret.startOffset;

      if (startContainer.nodeType !== Node.TEXT_NODE) {
        mentionActiveRef.current = false;
        mentionRangeRef.current = null;
        return;
      }

      const textNode = startContainer as Text;
      const newStart = Math.max(0, startOffset - 1);

      const s = textNode.data;
      if (s[newStart] !== '@') {
        mentionActiveRef.current = false;
        mentionRangeRef.current = null;
        return;
      }

      r.setStart(textNode, newStart);
      r.setEnd(textNode, startOffset);
      mentionActiveRef.current = false;
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

    r.deleteContents();

    const initial = user.last_name ? user.last_name.charAt(0) + '.' : '';
    const displayName = `${user.first_name} ${initial}`.trim();
    const chip = makeChipEl(user.id, displayName);
    const space = document.createTextNode(' ');

    r.insertNode(space);
    r.insertNode(chip);

    const newRange = document.createRange();
    newRange.setStartAfter(space);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);

    mentionRangeRef.current = null;
    setShowDropdown(false);
    setMentionQuery('');
    setSelectedIndex(0);

    if (!root.lastChild || root.lastChild.nodeType !== Node.TEXT_NODE) {
      root.appendChild(document.createTextNode(''));
    }

    commitChange();
    root.focus();
  };

  const handleInput = () => {
    finalizeMentionStartIfNeeded();
    if (showDropdown) {
      updateMentionQueryFromSelection();
    }
    commitChange();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === '@') {
      startMentionAtCaret();
      return;
    }

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

    if (e.key === 'Backspace' && editorRef.current) {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;

      const range = sel.getRangeAt(0);
      if (!range.collapsed) return;

      const container = range.startContainer;
      let prev: Node | null = null;

      if (container.nodeType === Node.TEXT_NODE) {
        if (range.startOffset === 0) {
          prev = container.previousSibling;
        }
      } else {
        const el = container as Element;
        prev = el.childNodes[range.startOffset - 1] ?? null;
      }

      if (prev instanceof HTMLElement && prev.hasAttribute('data-user-id')) {
        e.preventDefault();
        const chip = prev;
        const parent = chip.parentNode;
        if (!parent) return;

        const index = Array.prototype.indexOf.call(parent.childNodes, chip);
        chip.remove();

        const childAtIndex = parent.childNodes[index];
        if (!childAtIndex || childAtIndex.nodeType !== Node.TEXT_NODE) {
          parent.insertBefore(document.createTextNode(''), childAtIndex ?? null);
        }

        const textNode = parent.childNodes[index] as Text;
        const newRange = document.createRange();
        newRange.setStart(textNode, 0);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);

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

  return {
    editorRef,
    dropdownRef,
    showDropdown,
    filteredUsers,
    selectedIndex,
    mentionedIds,
    handleInput,
    handleKeyDown,
    insertMentionChip
  };
}
