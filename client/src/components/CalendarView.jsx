import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Modal, Form, Input, DatePicker, Button, message } from 'antd';
import axios from 'axios';

const { RangePicker } = DatePicker;

const CalendarView = () => {
  const [events, setEvents] = useState([]);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/calendar');
      setEvents(response.data);
    } catch (error) {
      message.error('获取日历事件失败');
    }
  };

  const handleDateSelect = (selectInfo) => {
    form.resetFields();
    setSelectedEvent({
      start: selectInfo.start,
      end: selectInfo.end
    });
    setModalVisible(true);
  };

  const handleEventClick = (clickInfo) => {
    form.setFieldsValue({
      title: clickInfo.event.title,
      dates: [clickInfo.event.start, clickInfo.event.end]
    });
    setSelectedEvent(clickInfo.event);
    setModalVisible(true);
  };

  const handleSaveEvent = async (values) => {
    try {
      const { title, dates } = values;
      const eventData = {
        title,
        start: dates[0].toISOString(),
        end: dates[1].toISOString()
      };

      if (selectedEvent.id) {
        // 更新现有事件
        await axios.put(`/api/calendar/${selectedEvent.id}`, eventData);
      } else {
        // 创建新事件
        await axios.post('/api/calendar', eventData);
      }

      setModalVisible(false);
      fetchEvents();
      message.success('事件保存成功');
    } catch (error) {
      message.error('保存事件失败');
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent.id) return;

    try {
      await axios.delete(`/api/calendar/${selectedEvent.id}`);
      setModalVisible(false);
      fetchEvents();
      message.success('事件已删除');
    } catch (error) {
      message.error('删除事件失败');
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>时间规划</h2>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={events}
        selectable={true}
        select={handleDateSelect}
        eventClick={handleEventClick}
        editable={true}
        eventDrop={async (info) => {
          try {
            await axios.put(`/api/calendar/${info.event.id}`, {
              start: info.event.start.toISOString(),
              end: info.event.end.toISOString()
            });
            message.success('事件时间已更新');
          } catch (error) {
            message.error('更新事件失败');
            info.revert();
          }
        }}
      />

      <Modal
        title={selectedEvent?.id ? '编辑事件' : '新建事件'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="delete" danger onClick={handleDeleteEvent} disabled={!selectedEvent?.id}>
            删除
          </Button>,
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            取消
          </Button>,
          <Button key="save" type="primary" onClick={() => form.submit()}>
            保存
          </Button>
        ]}
      >
        <Form
          form={form}
          name="eventForm"
          onFinish={handleSaveEvent}
          initialValues={{
            dates: selectedEvent?.start && selectedEvent?.end ? [selectedEvent.start, selectedEvent.end] : []
          }}
        >
          <Form.Item
            name="title"
            rules={[{ required: true, message: '请输入事件标题' }]}
          >
            <Input placeholder="事件标题" />
          </Form.Item>
          <Form.Item
            name="dates"
            rules={[{ required: true, message: '请选择时间范围' }]}
          >
            <RangePicker showTime format="YYYY-MM-DD HH:mm" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CalendarView;    