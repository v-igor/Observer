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
 * Teagent block config form definition
 *
 * @package    contrib
 * @subpackage block_observer
 * @copyright  2020 Igor Vukovic
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once(dirname(__FILE__) . '/../../config.php');

/**
 * Teagent block config form class
 *
 * @copyright 2020 Igor Vukovic
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class block_observer_edit_form extends block_edit_form {

    protected function specific_definition($mform) {

        // Start block specific section in config form.
        $mform->addElement('header', 'config_header', get_string('blocksettings', 'block'));
        $mform->addElement('text', 'config_text', get_string('blockstring', 'block_observer'));
        $mform->setType('config_text', PARAM_RAW);
    }
}
