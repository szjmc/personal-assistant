import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Space, Typography, Divider, Modal, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import Papa from 'papaparse';

const { Title, Text } = Typography;

const WordCards = () => {
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [isAddingWord, setIsAddingWord] = useState(false);
  const [newWord, setNewWord] = useState({ word: '', meaning: '' });
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    try {
      const response = await axios.get('/api/words');
      setWords(response.data);
    } catch (error) {
      message.error('获取单词失败');
    }
  };

  const handleNextWord = () => {
    setShowMeaning(false);
    setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
  };

  const handlePrevWord = () => {
    setShowMeaning(false);
    setCurrentWordIndex(
      (prevIndex) => (prevIndex - 1 + words.length) % words.length
    );
  };

  const handleToggleMeaning = () => {
    setShowMeaning(!showMeaning);
  };

  const handleAddWord = async () => {
    if (!newWord.word || !newWord.meaning) {
      message.warning('请输入单词和释义');
      return;
    }

    try {
      await axios.post('/api/words', newWord);
      setIsAddingWord(false);
      setNewWord({ word: '', meaning: '' });
      fetchWords();
      message.success('单词添加成功');
    } catch (error) {
      message.error('添加单词失败');
    }
  };

  const handleImportWords = (file) => {
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target.result;
        const result = Papa.parse(content, { header: true });
        const wordsToImport = result.data.map((item) => ({
          word: item.word,
          meaning: item.meaning,
        }));

        await axios.post('/api/words/batch', wordsToImport);
        fetchWords();
        message.success(`成功导入 ${wordsToImport.length} 个单词`);
      } catch (error) {
        message.error('导入单词失败');
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
    return false;
  };

  if (words.length === 0) {
    return (
      <Card>
        <p>暂无单词，请添加或导入单词</p>
        <Button onClick={() => setIsAddingWord(true)}>添加单词</Button>
        <Upload beforeUpload={handleImportWords} accept=".csv,.txt">
          <Button icon={<UploadOutlined />}>导入单词</Button>
        </Upload>
      </Card>
    );
  }

  const currentWord = words[currentWordIndex];

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>英语单词学习</h2>
      <Card style={{ marginBottom: 20 }}>
        <Space>
          <Button onClick={handlePrevWord}>上一个</Button>
          <Button onClick={handleToggleMeaning}>
            {showMeaning ? '隐藏释义' : '显示释义'}
          </Button>
          <Button onClick={handleNextWord}>下一个</Button>
          <Button onClick={() => setIsAddingWord(true)}>添加单词</Button>
          <Upload beforeUpload={handleImportWords} accept=".csv,.txt">
            <Button icon={<UploadOutlined />} loading={isImporting}>
              导入单词
            </Button>
          </Upload>
        </Space>
      </Card>

      <Card style={{ textAlign: 'center', padding: 40 }}>
        <Title level={2}>{currentWord.word}</Title>
        <Divider />
        {showMeaning && (
          <Text style={{ fontSize: 18 }}>{currentWord.meaning}</Text>
        )}
        <Divider />
        <Text>
          {currentWordIndex + 1}/{words.length}
        </Text>
      </Card>

      {isAddingWord && (
        <Modal
          title="添加新单词"
          visible={isAddingWord}
          onCancel={() => setIsAddingWord(false)}
          onOk={handleAddWord}
        >
          <Input
            placeholder="单词"
            value={newWord.word}
            onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
            style={{ marginBottom: 10 }}
          />
          <Input.TextArea
            placeholder="释义"
            value={newWord.meaning}
            onChange={(e) => setNewWord({ ...newWord, meaning: e.target.value })}
          />
        </Modal>
      )}
    </div>
  );
};

export default WordCards;    