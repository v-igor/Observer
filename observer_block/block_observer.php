<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.


/**
 * Simple Clock block definition
 *
 * @package    contrib
 * @subpackage block_observer
 * @copyright  2020 Igor Vukovic
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once(dirname(__FILE__) . '/../../config.php');


/**
 * Simple clock block class
 *
 * @copyright 2020 Igor Vukovic
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class block_observer extends block_base {

    /**
     * Sets the block title
     *
     * @return none
     */
    public function init() {
        //global $SESSION;
        //$SESSION->myvar=date("Y-m-d H:i:s");
        $this->title = get_string('observer_title_default', 'block_observer');
    }

    /**
     * Controls the block title based on instance configuration
     *
     * @return bool
     */
    public function specialization() {
        // Override the block title if an alternative is set.
       // if (isset($this->config->clock_title) && trim($this->config->clock_title) != '') {
         //   $this->title = format_string($this->config->clock_title);
       // }
    }

    /**
     * Defines where the block can be added
     *
     * @return array
     */
    public function applicable_formats() {
        return array(
            'course-view'    => true,
            'site-index'     => true,
            'mod'            => true,
            'my'             => true
        );
    }

    /**
     * Controls global configurability of block
     *
     * @return bool
     */
    public function instance_allow_config() {
        return false;
    }

    /**
     * Controls global configurability of block
     *
     * @return bool
     */
    public function has_config() {
        return false;
    }

    /**
     * Controls if a block header is shown based on instance configuration
     *
     * @return bool
     */
    public function hide_header() {
        return isset($this->config->show_header) && $this->config->show_header == 0;
    }

    /**
     * Creates the block's main content
     *
     * @return string
     */
    public function get_content() {

        global $USER, $OUTPUT, $CFG;//, $SESSION;

        if (isset($this->content)) {
            return $this->content;
        }

        
        // Start the content, which is primarily a table.
        $this->content = new stdClass;
        $this->content->text = '';
        $attributes = array();
        $attributes['id'] = 'observer_user';
        $attributes['value'] =  md5($USER->username.$USER->email);//.$SESSION->myvar;
        $attributes['type'] =  'hidden';
        $this->content->text .="<span id='advice'></span>";
        $this->content->text .= HTML_WRITER::empty_tag('input', $attributes);
        // $this->content->footer = '';
         // $table = new html_table();
        // $table->attributes = array('class' => 'observerTable');
        // $attributes = array();
        // $attributes['id'] = 'observer_user';
        // $attributes['value'] =  md5($USER->username.$USER->email);//.$SESSION->myvar;
        // $attributes['type'] =  'hidden';
        // $row[] = HTML_WRITER::empty_tag('input', $attributes);
        //  $table->data[] = $row;
        //  $this->content->text .="<span id='advice'></span>";
        //  $this->content->text .= HTML_WRITER::table($table);
        
        
        

        // Set up JavaScript code
        $noscriptstring = get_string('javascript_disabled', 'block_observer');
        $this->content->text .= HTML_WRITER::tag('noscript', $noscriptstring);

        $arguments = array();
        $jsmodule = array(
            'name' => 'block_observer',
            'fullpath' => '/blocks/observer/module.js',
            'requires' => array(),
            'strings' => array(),
        );
        $this->page->requires->js_init_call('M.block_observer.initObserver',
                                            $arguments, false, $jsmodule);

        $this->content->footer = '';
        return $this->content;
    }
}
